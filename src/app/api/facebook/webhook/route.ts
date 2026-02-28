
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

  if (mode === 'subscribe' && token === verifyToken) {
    return new Response(challenge, { status: 200 });
  } else {
    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-hub-signature-256');
  const rawBody = await req.text();
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  if (!appSecret || !verifyFacebookSignature(rawBody, signature, appSecret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Respond 200 immediately to Meta
  const response = NextResponse.json({ success: true }, { status: 200 });

  // Process async
  (async () => {
    try {
      const body = JSON.parse(rawBody);
      const { firestore } = initializeFirebase();

      for (const entry of body.entry) {
        const pageId = entry.id;
        
        // Load Page Credentials
        const pageDoc = await getDoc(doc(firestore, 'facebook_pages', pageId));
        if (!pageDoc.exists()) continue;

        const { pageAccessToken, userAccountId } = pageDoc.data();

        for (const messagingEvent of entry.messaging) {
          const senderId = messagingEvent.sender.id;
          const message = messagingEvent.message;

          if (!message || message.is_echo || !message.text) continue;

          const userMessageText = message.text;

          // 1. Find or Create Conversation
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

          // 3. Fetch History for Context
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

          // 4. Generate AI Response
          const { welcomeMessage } = await generateWelcomeMessage({
            customerName: 'Customer', // Can be refined by fetching PSID profile
            socialMediaPlatform: 'Facebook',
            userMessage: userMessageText,
            userId: userAccountId,
            chatHistory: chatHistory.slice(0, -1), // Don't include the current message twice
          });

          // 5. Send to Facebook
          await sendFacebookMessage(pageAccessToken, senderId, welcomeMessage);

          // 6. Save AI Response to Firestore
          await addDoc(collection(convoRef, 'messages'), {
            conversationId: convoId,
            senderType: 'ai',
            content: welcomeMessage,
            timestamp: serverTimestamp(),
            userAccountId,
          });

          // 7. Update Convo timestamp
          await setDoc(convoRef, { lastMessageTimestamp: serverTimestamp() }, { merge: true });
        }
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
    }
  })();

  return response;
}
