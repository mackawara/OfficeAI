# DigitalOcean App Platform Deployment Guide

This guide explains how to deploy the OfficeAI application to DigitalOcean App Platform using GitHub Actions.

## Prerequisites

1. A DigitalOcean account
2. A GitHub repository with your code
3. DigitalOcean CLI (`doctl`) installed locally (optional, for manual testing)

## Setup Steps

### 1. Create DigitalOcean App

First, create your app on DigitalOcean App Platform:

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Connect your GitHub repository
4. Configure your app settings using the existing `app.yaml` file
5. Note down your **App ID** (you'll need this for the CI/CD pipeline)

### 2. Generate DigitalOcean Access Token

1. Go to [DigitalOcean API Tokens](https://cloud.digitalocean.com/account/api/tokens)
2. Click "Generate New Token"
3. Give it a name (e.g., "GitHub Actions Deploy")
4. Select "Write" scope
5. Copy the token (you'll only see it once)

### 3. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add the following secrets:

#### Required Secrets:

- `DIGITALOCEAN_ACCESS_TOKEN`: Your DigitalOcean API token
- `DIGITALOCEAN_APP_ID`: Your DigitalOcean App ID
- `MONGODB_URI`: Your MongoDB connection string
- `OPENAI_API_KEY`: Your OpenAI API key
- `NEXTAUTH_SECRET`: A secure random string for NextAuth
- `NEXTAUTH_URL`: Your app's URL (e.g., `https://your-app-name.ondigitalocean.app`)

### 4. Update app.yaml (if needed)

Make sure your `app.yaml` file is properly configured. The current configuration should work, but you may want to update the environment variables to use secrets instead of hardcoded values.

## How the CI/CD Pipeline Works

### Workflow Triggers
- **Push to main/master**: Triggers full deployment
- **Pull Request**: Runs tests only (no deployment)

### Pipeline Steps

1. **Test Job**:
   - Checkout code
   - Setup Node.js 20
   - Install dependencies
   - Run TypeScript type checking
   - Run ESLint
   - Build the application

2. **Deploy Job** (only on main/master):
   - Runs after successful tests
   - Builds the application
   - Installs DigitalOcean CLI
   - Deploys to DigitalOcean App Platform
   - Checks deployment status

## Environment Variables

The following environment variables are used during build and runtime:

- `MONGODB_URI`: MongoDB connection string
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `NEXTAUTH_URL`: Your application URL

## Troubleshooting

### Common Issues

1. **Build Failures**: Check that all environment variables are properly set in GitHub Secrets
2. **Deployment Timeout**: The pipeline waits up to 10 minutes for deployment
3. **App ID Issues**: Make sure your `DIGITALOCEAN_APP_ID` is correct

### Manual Deployment

If you need to deploy manually:

```bash
# Install doctl
brew install doctl  # macOS
# or download from https://github.com/digitalocean/doctl/releases

# Authenticate
doctl auth init

# Deploy
doctl apps create-deployment YOUR_APP_ID
```

### Monitoring Deployments

You can monitor your deployments in the DigitalOcean console or using the CLI:

```bash
doctl apps list-deployments YOUR_APP_ID
doctl apps get-deployment YOUR_APP_ID DEPLOYMENT_ID
```

## Security Notes

- Never commit sensitive information like API keys to your repository
- Use GitHub Secrets for all sensitive data
- Regularly rotate your DigitalOcean access token
- Consider using DigitalOcean's container registry for more secure deployments

## Next Steps

1. Push your code to the main branch to trigger the first deployment
2. Monitor the deployment in the GitHub Actions tab
3. Check your app status in the DigitalOcean console
4. Set up custom domains if needed
5. Configure monitoring and alerts 