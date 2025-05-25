#!/bin/bash

# THIS IS THE FINAL ONE-STEP DEPLOYMENT SCRIPT
# Just run this single command and it will fix everything

# Clean up any existing deployment
echo "Cleaning up existing deployment..."
pm2 stop all
pm2 delete all
cd ~
rm -rf YourAppName-Restored
mkdir -p YourAppName-Restored
cd YourAppName-Restored

# Ensure port is open
echo "Setting up firewall..."
sudo ufw allow 3006/tcp

# Get the latest code
echo "Getting latest code..."
git clone https://github.com/bashhh89/newfixsg.git .
git checkout againbranch

# Set up environment with autocomplete enabled
echo "Setting up environment..."
cp env.production.template .env.local
echo 'NEXT_PUBLIC_ENABLE_AUTO_COMPLETE=true' >> .env.local

# Install dependencies and build the app
echo "Installing dependencies and building app..."
npm install -g pnpm
pnpm install
pnpm run build

# Start the application with PM2 on port 3006
echo "Starting application with PM2..."
pm2 start npm --name "nextjs-app" -- start -- -p 3006
pm2 save

# Set up PM2 to start on boot
echo "Setting up PM2 to start on system boot..."
pm2 startup
pm2 save

echo "======================================================="
echo "DEPLOYMENT COMPLETE!"
echo "Your app is now running at http://YOUR_SERVER_IP:3006"
echo "Autocomplete is ENABLED"
echo "=======================================================" 