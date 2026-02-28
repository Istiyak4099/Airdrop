
import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc, collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { verifyFacebookSignature, sendFacebookMessage } from '@/lib/facebook';
import { generateWelcomeMessage } from '@/ai/flows/generate-welcome-message';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.FACEBOOK_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Webhook Verified Successfully');
    return new Response(challenge, { status: 200 });
  } else {
    console.error('Webhook Verification Failed', { 
      receivedToken: token, 
      expectedToken: verifyToken,
      mode: mode 
    });
    return new Response('Verification failed', { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-hub-signature-256');
  const rawBody = await req.text();
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  console.log('Incoming Webhook POST request');

  if (!appSecret) {
    console.error('FACEBOOK_APP_SECRET is not set in environment variables');
    return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
  }

  if (!verifyFacebookSignature(rawBody, signature, appSecret)) {
    console.error('Invalid Facebook Signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Process message logic asynchronously to avoid Meta timeouts
  const body = JSON.parse(rawBody);
  
  // Create a separate promise to handle the logic
  const processEvents = async () => {
    try {
      const { firestore } = initializeFirebase();

      for (const entry of body.entry) {
        const pageId = entry.id;
        console.log(`Processing entry for Page ID: ${pageId}`);
        
        const pageDoc = await getDoc(doc(firestore, 'facebook_pages', pageId));
        if (!pageDoc.exists()) {
          console.warn(`No credentials found for Page ID: ${pageId}`);
          continue;
        }

        const { pageAccessToken, userAccountId } = pageDoc.data();

        for (const messagingEvent of entry.messaging) {
          const senderId = messagingEvent.sender.id;
          const message = messagingEvent.message;

          if (!message || message.is_echo || !message.text) {
            console.log('Skipping echo or non-text message');
            continue;
          }

          const userMessageText = message.text;
          console.log(`Received message from ${senderId}: ${userMessageText}`);

          const convoId = `${pageId}_${senderId}`;
          const convoRef = doc(firestore, 'userAccounts', userAccountId, 'conversations', convoId);
          const convoSnap = await getDoc(convoRef);

          if (!convoSnap.exists()) {
            await setDoc(convoRef, {
              id: convoId,
              customerId: senderId,
              status: 'open',
              lastMessageTimestamp: serverTimestamp(),
              userAccountId,
              createdAt: serverTimestamp(),
            });
          }

          await addDoc(collection(convoRef, 'messages'), {
            conversationId: convoId,
            senderType: 'user',
            content: userMessageText,
            timestamp: serverTimestamp(),
            userAccountId,
          });

          const messagesQuery = query(
            collection(convoRef, 'messages'),
            orderBy('timestamp', 'desc'),
            limit(10)
          );
          const historySnap = await getDocs(messagesQuery);
          const chatHistory = historySnap.docs
            .map(d => ({
              sender: d.data().senderType === 'user' ? 'user' as const : 'ai' as const,
              content: d.data().content,
            }))
            .reverse();

          console.log('Generating AI response...');
          const { welcomeMessage } = await generateWelcomeMessage({
            customerName: 'Customer', 
            socialMediaPlatform: 'Facebook',
            userMessage: userMessageText,
            userId: userAccountId,
            chatHistory: chatHistory.slice(0, -1),
          });

          console.log(`Sending response to ${senderId}: ${welcomeMessage}`);
          await sendFacebookMessage(pageAccessToken, senderId, welcomeMessage);

          await addDoc(collection(convoRef, 'messages'), {
            conversationId: convoId,
            senderType: 'ai',
            content: welcomeMessage,
            timestamp: serverTimestamp(),
            userAccountId,
          });

          await setDoc(convoRef, { lastMessageTimestamp: serverTimestamp() }, { merge: true });
          console.log('Webhook processing completed successfully for message');
        }
      }
    } catch (error) {
      console.error('Detailed Webhook processing error:', error);
    }
  };

  // Start processing but return 200 immediately
  processEvents();

  return NextResponse.json({ success: true }, { status: 200 });
}
