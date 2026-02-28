
import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get('X-Admin-Key');
  const configuredKey = process.env.ADMIN_API_KEY;

  if (!configuredKey || adminKey !== configuredKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { pageId, pageAccessToken, pageName, userAccountId } = body;

    if (!pageId || !pageAccessToken || !userAccountId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { firestore } = initializeFirebase();
    const pageRef = doc(firestore, 'facebook_pages', pageId);

    await setDoc(pageRef, {
      pageId,
      pageAccessToken,
      pageName: pageName || null,
      userAccountId,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return NextResponse.json({ success: true, message: 'Page token stored successfully' });
  } catch (error: any) {
    console.error('Admin Store Token Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
