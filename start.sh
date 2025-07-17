#!/bin/sh
echo "===== Environment Variables ====="
printenv | grep -E "(MONGODB|NEXTAUTH_URL|OPENAI_API_KEY|NEXTAUTH_SECRET)" || echo "No env vars found"
echo "================================="
echo "===== Checking .env file ====="
ls -la /code/.env.local || echo ".env file not found"
echo "================================="
yarn start       # Start your Node.js application docker ps
