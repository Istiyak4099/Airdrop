
# Airdrop - AI-Powered Customer Assistant

Airdrop automates your customer messaging on Facebook, responding instantly using AI tailored to your business profile.

## Facebook Integration Setup

To connect your Facebook Page, follow these steps:

### 1. Configure Environment Variables
Add the following to your `.env` file (and your deployment secrets):
- `FACEBOOK_APP_SECRET`: Found in your Meta App Dashboard under Settings > Basic.
- `FACEBOOK_VERIFY_TOKEN`: Any secret string you choose.
- `ADMIN_API_KEY`: Any secret string you choose.

### 2. Set Up Meta Webhook
1. Go to your [Meta App Dashboard](https://developers.facebook.com/).
2. Add the **Messenger** product.
3. Go to **Messenger > Settings**.
4. In the **Webhooks** section, click **Configure**.
5. **Callback URL**: `https://<your-domain>/api/facebook/webhook`
6. **Verify Token**: Use the same string you set for `FACEBOOK_VERIFY_TOKEN`.
7. Once verified, subscribe to the `messages` field.

### 3. Store Page Access Token
Generate a **Page Access Token** in the Meta Dashboard (Messenger > Settings > Token Generation). Then, send it to your app's admin endpoint to store it securely in Firestore:

```bash
curl -X POST https://<your-domain>/api/admin/facebook/page-token \
  -H "X-Admin-Key: <your_ADMIN_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "pageId": "your_facebook_page_id",
    "pageAccessToken": "your_generated_page_access_token",
    "pageName": "Your Page Name",
    "userAccountId": "your_firebase_user_uid"
  }'
```

The AI will now automatically reply to messages sent to that Facebook Page based on the settings in your Airdrop dashboard.
