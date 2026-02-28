
import crypto from 'crypto';

/**
 * Verifies the X-Hub-Signature-256 header sent by Meta.
 * @param payload The raw request body as a string.
 * @param signature The signature header value.
 * @param secret Your Facebook App Secret.
 */
export function verifyFacebookSignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return false;
  
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch (e) {
    return false;
  }
}

/**
 * Sends a message back to a user via the Meta Graph API.
 * @param pageAccessToken The Page Access Token.
 * @param recipientId The user's PSID.
 * @param text The response text.
 */
export async function sendFacebookMessage(pageAccessToken: string, recipientId: string, text: string) {
  const url = `https://graph.facebook.com/v25.0/me/messages?access_token=${pageAccessToken}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Facebook Send API Error:', errorData);
    throw new Error(`Facebook API error: ${response.statusText}`);
  }

  return response.json();
}
