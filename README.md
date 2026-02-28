
# Airdrop - AI-Powered Customer Assistant

Airdrop automates your customer messaging on Facebook, responding instantly using AI tailored to your business profile.

## Facebook Integration Setup

To connect your Facebook Page, follow these steps:

### 1. Configure Environment Variables
Add the following to your `.env` file (and your deployment secrets):
- `FACEBOOK_APP_SECRET`: Found in your Meta App Dashboard under **App settings > Basic**.
- `FACEBOOK_VERIFY_TOKEN`: Any secret string you choose (e.g., `airdrop_verify_2024`). **This is what you paste into the "Verify token" field in your screenshot.**
- `ADMIN_API_KEY`: Any secret string you choose (used to authorize your internal token setup).

### 2. Set Up Meta Webhook (As seen in your screenshot)
1. Go to your [Meta App Dashboard](https://developers.facebook.com/).
2. Click on **Use cases** in the left sidebar.
3. Find **Messenger** and click **Edit** or **Customize**.
4. Find the **Configure webhooks** section (as shown in your screenshot).
5. **Callback URL**: `https://<your-domain>/api/facebook/webhook`
6. **Verify Token**: Use the same string you set for `FACEBOOK_VERIFY_TOKEN`.
7. Click **Verify and save**.
8. **IMPORTANT**: After verification, find the **Webhooks** management section on that same page and click **Manage**. Check the box for **`messages`** to subscribe to incoming messages.

### 3. Store Page Access Token
Generate a **Page Access Token** in the Meta Dashboard (usually under Messenger > Settings > Token Generation). Then, send it to your app's admin endpoint to store it securely in Firestore:

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
