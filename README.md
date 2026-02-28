
# Airdrop - AI-Powered Customer Assistant

Airdrop automates your customer messaging on Facebook, responding instantly using AI tailored to your business profile.

## Facebook Integration Setup

Follow these steps to connect your Facebook Page to the AI:

### 1. Configure Secret Tokens
Invent two passwords (tokens) and set them in your **Firebase Console > App Hosting > [Your Backend] > Settings > Environment Variables**:

- `FACEBOOK_VERIFY_TOKEN`: Invent any string (e.g., `airdrop_verify_2026`).
- `ADMIN_API_KEY`: Invent any string (e.g., `my_admin_key_99`).
- `FACEBOOK_APP_SECRET`: Copy this from **Meta App Dashboard > App settings > Basic**.

**Redeploy** the app after changing variables.

### 2. Set Up Meta Webhook
1. Go to your [Meta App Dashboard](https://developers.facebook.com/).
2. Navigate to **Use cases** -> **Messenger** -> **Edit**.
3. Under **Configure webhooks**, click **Configure**:
   - **Callback URL**: `https://www.rareflex.store/api/facebook/webhook`
   - **Verify Token**: Enter your `FACEBOOK_VERIFY_TOKEN`.
4. Click **Verify and save**.
5. **CRITICAL**: Click **Manage** and **Subscribe** to the `messages` field.

### 3. Store Page Access Token (Final Link)
After verification, generate a **Page Access Token** in the Meta Dashboard. Then, use the command below to link it to your app account:

```bash
# Replace <...> with your actual values
curl -X POST https://www.rareflex.store/api/admin/facebook/page-token \
  -H "X-Admin-Key: <your_ADMIN_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "pageId": "<your_facebook_page_id>",
    "pageAccessToken": "<your_page_access_token>",
    "pageName": "My Page Name",
    "userAccountId": "<your_user_uid_from_dashboard>"
  }'
```

### 4. Test it!
Send a message to your Facebook Page. The AI will respond automatically using your configured business profile settings.
