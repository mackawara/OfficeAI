#!/bin/bash

# Setup script for DigitalOcean App Platform deployment secrets
# This script helps you gather the necessary information for GitHub Secrets

echo "🔧 DigitalOcean App Platform Deployment Setup"
echo "=============================================="
echo ""

echo "📋 Required GitHub Secrets:"
echo ""

echo "1. DIGITALOCEAN_ACCESS_TOKEN"
echo "   - Go to: https://cloud.digitalocean.com/account/api/tokens"
echo "   - Click 'Generate New Token'"
echo "   - Name: 'GitHub Actions Deploy'"
echo "   - Scope: 'Write'"
echo "   - Copy the token"
echo ""

echo "2. DIGITALOCEAN_APP_ID"
echo "   - Go to: https://cloud.digitalocean.com/apps"
echo "   - Create your app or select existing app"
echo "   - Copy the App ID from the URL or app details"
echo ""

echo "3. MONGODB_URI"
echo "   - Your MongoDB connection string"
echo "   - Format: mongodb+srv://username:password@cluster.mongodb.net/database"
echo ""

echo "4. OPENAI_API_KEY"
echo "   - Get from: https://platform.openai.com/api-keys"
echo ""

echo "5. NEXTAUTH_SECRET"
echo "   - Generate a secure random string"
echo "   - You can use: openssl rand -base64 32"
echo ""

echo "6. NEXTAUTH_URL"
echo "   - Your app's URL (e.g., https://your-app-name.ondigitalocean.app)"
echo ""

echo "📝 To add these secrets:"
echo "1. Go to your GitHub repository"
echo "2. Settings → Secrets and variables → Actions"
echo "3. Click 'New repository secret'"
echo "4. Add each secret with the exact names above"
echo ""

echo "🚀 After setting up secrets:"
echo "1. Push your code to the main branch"
echo "2. Check the Actions tab for deployment status"
echo "3. Monitor your app in DigitalOcean console"
echo ""

# Generate a secure NEXTAUTH_SECRET if requested
if [ "$1" = "--generate-secret" ]; then
    echo "🔐 Generated NEXTAUTH_SECRET:"
    openssl rand -base64 32
    echo ""
fi 