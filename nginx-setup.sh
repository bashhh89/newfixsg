#!/bin/bash

# Stop existing processes
pm2 stop all
pm2 delete all

# Make sure ports are open
sudo ufw allow 80/tcp
sudo ufw allow 3006/tcp

# Create nginx config file
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/sites-available/nextjs
sudo rm -f /etc/nginx/sites-enabled/nextjs

# Create new nginx config
sudo tee /etc/nginx/sites-available/nextjs > /dev/null << 'EOF'
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

# Enable the config
sudo ln -s /etc/nginx/sites-available/nextjs /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Clean up everything and restart fresh
cd ~
rm -rf YourAppName-Restored
mkdir -p YourAppName-Restored
cd YourAppName-Restored

# Clone the repository
git clone https://github.com/bashhh89/newfixsg.git .
git checkout againbranch

# Setup environment
cp env.production.template .env.local
echo 'NEXT_PUBLIC_ENABLE_AUTO_COMPLETE=true' >> .env.local

# Install dependencies and build
pnpm install --frozen-lockfile=false
pnpm run build

# Start with PM2 on port 3006
PORT=3006 pm2 start npm --name "nextjs-app" -- start
pm2 save
pm2 startup

echo "====================================="
echo "Setup complete! Your app should now be running at http://YOUR_SERVER_IP"
echo "=====================================" 