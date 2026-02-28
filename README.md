
# Airdrop - AI-Powered Customer Assistant

Airdrop automates your customer messaging on Facebook, responding instantly using AI tailored to your business profile.

## Facebook Integration Setup

To connect your Facebook Page, follow these steps:

### 1. Configure Secret Tokens
You need to "invent" two secret passwords (tokens) for your app. Open your `.env` file and set these:
- `FACEBOOK_VERIFY_TOKEN`: Invent any random string (e.g., `airdrop_verify_2024`). **This is what you paste into the "Verify token" field in the Meta Dashboard.**
- `ADMIN_API_KEY`: Invent any random string (e.g., `my_admin_setup_key`). You'll use this once to authorize your token setup.

Also, get your `FACEBOOK_APP_SECRET` from the Meta App Dashboard under **App settings > Basic**.

### 2. Set Up Meta Webhook
1. Go to your [Meta App Dashboard](https://developers.facebook.com/).
2. Click on **Use cases** in the left sidebar.
3. Find **Messenger** and click **Edit** or **Customize**.
4. Find the **Configure webhooks** section.
5. **Callback URL**: `https://<your-domain>/api/facebook/webhook` (Replace `<your-domain>` with your actual live URL).
6. **Verify Token**: Use the **exact same string** you invented for `FACEBOOK_VERIFY_TOKEN` in step 1.
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
