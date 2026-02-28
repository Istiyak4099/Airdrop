
# Airdrop - AI-Powered Customer Assistant

Airdrop automates your customer messaging on Facebook, responding instantly using AI tailored to your business profile.

## Facebook Integration Setup

To connect your Facebook Page, follow these steps exactly:

### 1. Configure Secret Tokens
You need to "invent" two secret passwords (tokens) for your app. 

**IMPORTANT**: These must be set in your **Firebase App Hosting Environment Variables** (in the Firebase Console) for the live site to work.

- `FACEBOOK_VERIFY_TOKEN`: Invent any random string (e.g., `airdrop_verify_2026`). **This is what you paste into the "Verify token" field in the Meta Dashboard.**
- `ADMIN_API_KEY`: Invent any random string (e.g., `my_admin_setup_key_99`). You'll use this to authorize your token setup.
- `FACEBOOK_APP_SECRET`: Get this from Meta App Dashboard under **App settings > Basic**.

### 2. Set Up Meta Webhook
1. Go to your [Meta App Dashboard](https://developers.facebook.com/).
2. Click on **Use cases** -> **Messenger** -> **Edit** or **Customize**.
3. Find **Configure webhooks**.
4. **Callback URL**: `https://www.rareflex.store/api/facebook/webhook`
5. **Verify Token**: Use the **exact same string** you set for `FACEBOOK_VERIFY_TOKEN` (e.g., `airdrop_verify_2026`).
6. Click **Verify and save**.

#### Troubleshooting Verification
If Meta says it "couldn't be validated":
- Ensure your latest code is fully deployed to `www.rareflex.store`.
- Go to **Firebase Console > App Hosting > [Your Backend] > Settings > Environment Variables**.
- Add `FACEBOOK_VERIFY_TOKEN` with your chosen value and `FACEBOOK_APP_SECRET`.
- **Redeploy** the app after changing environment variables to ensure they take effect.

### 3. Store Page Access Token
After the webhook is verified, generate a **Page Access Token** in the Meta Dashboard. Then, send it to your app's admin endpoint to store it securely:

```bash
curl -X POST https://www.rareflex.store/api/admin/facebook/page-token \
  -H "X-Admin-Key: <your_ADMIN_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "pageId": "your_facebook_page_id",
    "pageAccessToken": "your_generated_page_access_token",
    "pageName": "Your Page Name",
    "userAccountId": "your_firebase_user_uid"
  }'
```

The AI will now automatically reply to messages sent to that Facebook Page!
