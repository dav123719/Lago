#!/bin/bash
set -e
cd /var/www/lago-website
echo "Installing dependencies..."
npm install --production
echo "Building application..."
npm run build
echo "Restarting PM2..."
pm2 restart lago-website 2>/dev/null || pm2 start npm --name "lago-website" -- start
pm2 save
echo "Deployment complete!"

