#!/bin/bash

# THIS IS THE FINAL ONE-STEP DEPLOYMENT SCRIPT
# Just run this single command and it will fix everything

# Clean up any existing deployment
echo "Cleaning up existing deployment..."
sudo systemctl stop nginx
pm2 stop all
pm2 delete all
cd ~
rm -rf YourAppName-Restored
mkdir -p YourAppName-Restored
cd YourAppName-Restored

# Ensure ports are open
echo "Setting up firewall..."
sudo ufw allow 80/tcp
sudo ufw allow 3006/tcp

# Get the latest code
echo "Getting latest code..."
git clone https://github.com/bashhh89/newfixsg.git .
git checkout againbranch

# Set up environment with autocomplete enabled
echo "Setting up environment..."
cp env.production.template .env.local
echo 'NEXT_PUBLIC_ENABLE_AUTO_COMPLETE=true' >> .env.local

# Set up nginx to proxy to port 3006
echo "Setting up nginx..."
sudo rm -f /etc/nginx/sites-enabled/default
cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

sudo cp nginx.conf /etc/nginx/sites-available/nextjs
sudo ln -sf /etc/nginx/sites-available/nextjs /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install dependencies and build
echo "Installing dependencies and building app..."
pnpm install --frozen-lockfile=false
pnpm run build

# Start with PM2 on port 3006
echo "Starting app with PM2..."
PORT=3006 pm2 start npm --name "nextjs-app" -- start
pm2 save
pm2 startup

# Display final message
echo ""
echo "======================================================"
echo "DEPLOYMENT COMPLETE!"
echo "Your app is now running at http://YOUR_SERVER_IP"
echo "Autocomplete is ENABLED"
echo "======================================================" 