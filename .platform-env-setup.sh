#!/bin/bash
# Platform environment setup script for EasyPanel deployment

# Make sure this script doesn't fail if variables are missing
set -e

# Echo deployment info
echo "Setting up environment for deployment..."

# Verify required environment variables
REQUIRED_VARS=(
  "OPENAI_API_KEY"
  "NEXT_PUBLIC_FIREBASE_API_KEY"
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" 
  "NEXT_PUBLIC_FIREBASE_APP_ID"
  "FIREBASE_CLIENT_EMAIL"
  "FIREBASE_PRIVATE_KEY"
  "RESEND_API_KEY"
)

# Check if required variables exist
MISSING_VARS=()
for VAR in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!VAR}" ]]; then
    MISSING_VARS+=("$VAR")
  fi
done

# Warn about missing variables but don't fail the build
if [[ ${#MISSING_VARS[@]} -gt 0 ]]; then
  echo "⚠️ WARNING: The following environment variables are missing:"
  for VAR in "${MISSING_VARS[@]}"; do
    echo "  - $VAR"
  done
  echo "Application may not function correctly without these variables."
else
  echo "✅ All required environment variables are set."
fi

echo "Environment setup completed." 