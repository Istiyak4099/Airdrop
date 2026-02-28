
import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { verifyFacebookSignature, sendFacebookMessage } from '@/lib/facebook';
import { generateWelcomeMessage } from '@/ai/flows/generate-welcome-message';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.FACEBOOK_VERIFY_TOKEN;

  // Logging for debugging verification issues in hosting logs
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Webhook Verified Successfully');
    // Meta expects the challenge to be returned as a raw string
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

  if (!appSecret || !verifyFacebookSignature(rawBody, signature, appSecret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Respond 200 immediately to Meta to avoid timeouts/retries
  const response = NextResponse.json({ success: true }, { status: 200 });

  // Process message logic asynchronously
  (async () => {
    try {
      const body = JSON.parse(rawBody);
      const { firestore } = initializeFirebase();

      for (const entry of body.entry) {
        const pageId = entry.id;
        
        // Load Page Credentials from root collection for speed
        const pageDoc = await getDoc(doc(firestore, 'facebook_pages', pageId));
        if (!pageDoc.exists()) continue;

        const { pageAccessToken, userAccountId } = pageDoc.data();

        for (const messagingEvent of entry.messaging) {
          const senderId = messagingEvent.sender.id;
          const message = messagingEvent.message;

          // Ignore echoes and non-text messages
          if (!message || message.is_echo || !message.text) continue;

          const userMessageText = message.text;

          // 1. Find or Create Conversation in User's sub-collection
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

          // 2. Save User Message
          await addDoc(collection(convoRef, 'messages'), {
            conversationId: convoId,
            senderType: 'user',
            content: userMessageText,
            timestamp: serverTimestamp(),
            userAccountId,
          });

          // 3. Fetch History for Context (last 10 messages)
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

          // 4. Generate AI Response using your existing flow
          const { welcomeMessage } = await generateWelcomeMessage({
            customerName: 'Customer', 
            socialMediaPlatform: 'Facebook',
            userMessage: userMessageText,
            userId: userAccountId,
            chatHistory: chatHistory.slice(0, -1), // Exclude the message we just saved to avoid duplication in prompt
          });

          // 5. Send reply via Meta Graph API
          await sendFacebookMessage(pageAccessToken, senderId, welcomeMessage);

          // 6. Save AI Response to Firestore
          await addDoc(collection(convoRef, 'messages'), {
            conversationId: convoId,
            senderType: 'ai',
            content: welcomeMessage,
            timestamp: serverTimestamp(),
            userAccountId,
          });

          // 7. Update Conversation last activity timestamp
          await setDoc(convoRef, { lastMessageTimestamp: serverTimestamp() }, { merge: true });
        }
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
    }
  })();

  return response;
}
