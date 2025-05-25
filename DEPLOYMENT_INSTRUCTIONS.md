# Server Deployment Instructions

This document provides comprehensive instructions for deploying the AI Scorecard application on a Linux/Ubuntu server.

## One-Command Deployment Script

```bash
#!/bin/bash
# AI Scorecard Complete Deployment Script

# 1. Clean up any existing installation to prevent space issues
cd ~ && \
rm -rf YourAppName-Restored && \
mkdir -p YourAppName-Restored && \
cd YourAppName-Restored && \

# 2. Clone the repository with the latest fixes
git clone https://github.com/your-username/yourgithubrepo.git . && \
git checkout againbranch && \

# 3. Copy and edit the .env.local file with required configuration
cp env.production.template .env.local && \
echo 'NEXT_PUBLIC_ENABLE_AUTO_COMPLETE=true' >> .env.local && \
echo 'GOOGLE_API_KEY=your_google_api_key_here' >> .env.local && \

# 4. Install dependencies and build the application
pnpm install --frozen-lockfile=false && \
pnpm run build && \

# 5. Install and configure PM2 for production management
npm install -g pm2 && \
pm2 start ecosystem.config.js && \
pm2 save && \
pm2 startup
```

## Required Environment Variables

For the application to function correctly, including autocomplete functionality, ensure these variables are in your `.env.local` file:

```
# Essential Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Enable Autocomplete Feature (CRITICAL!)
NEXT_PUBLIC_ENABLE_AUTO_COMPLETE=true

# AI Provider API Keys (required for autocomplete)
GOOGLE_API_KEY=your_google_api_key_here

# Firebase Admin (for PDF generation)
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key
```

## Space Management

If you receive "running out of space" warnings:

1. SSH into your server
2. Run the cleanup script:

```bash
cd ~/YourAppName-Restored
rm -rf .next
rm -rf node_modules/.cache
rm -rf .vercel/output
```

## Troubleshooting

### Autocomplete Not Working

If the autocomplete feature is not working:

1. Check that `NEXT_PUBLIC_ENABLE_AUTO_COMPLETE=true` is in your `.env.local` file
2. Ensure `GOOGLE_API_KEY` is set with a valid API key
3. Restart the application: `pm2 restart all`
4. Check logs for errors: `pm2 logs`

### Report Generation Stuck at Loading Screen

If reports get stuck at the loading screen:

1. Use the "View Results Now" emergency button that appears after 10 seconds
2. If issues persist, check server logs: `pm2 logs` 