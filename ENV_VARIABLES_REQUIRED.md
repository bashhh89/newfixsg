# Required Environment Variables for Deployment

Copy these variables to your Netlify environment variables settings in the Netlify dashboard:

```
# OpenAI API
OPENAI_API_KEY=your_openai_key

# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Firebase Admin
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key

# Resend Email
RESEND_API_KEY=your_resend_api_key
```

**Important Notes:**
1. Environment variables from your local `.env.local` file are NOT automatically transferred to Netlify
2. You must manually add these in your Netlify project settings under "Site settings" > "Environment variables"
3. For `FIREBASE_PRIVATE_KEY`, you may need to wrap the value in double quotes and include newlines as `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"` 
# OpenAI Model
OPENAI_MODEL=your_openai_model

# Google Gemini Configuration
GOOGLE_API_KEY=your_google_api_key
GOOGLE_MODEL=your_google_model

# Pollinations Configuration
POLLINATIONS_MODEL=your_pollinations_model

# Resend Additional Config
LEAD_NOTIFICATION_EMAIL=your_lead_notification_email

# Firebase Admin SDK Configuration (BACKEND - e.g., for PDF API route)
# This is the Base64 encoded content of your Firebase Admin SDK service account JSON key.
FIREBASE_SERVICE_ACCOUNT_KEY=your_firebase_service_account_key_base64

# Auto-complete Feature
NEXT_PUBLIC_ENABLE_AUTO_COMPLETE=true_or_false

# Weasyprint Service URL
WEASYPRINT_SERVICE_URL=your_weasyprint_service_url