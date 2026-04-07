#!/bin/bash
# Bendigo Phoenix — Deploy Script
# Builds the site and uploads to VentraIP via SFTP
#
# SETUP REQUIRED:
# 1. Install lftp: sudo apt install lftp (Linux) or brew install lftp (Mac)
# 2. Set environment variables or update the values below:
#    export SFTP_HOST="your-ventraip-host"
#    export SFTP_USER="your-username"
#    export SFTP_PASS="your-password"
#    export SFTP_DIR="/public_html"   # Remote directory

set -e  # Exit on error

SFTP_HOST="${SFTP_HOST:-your-ventraip-sftp-host}"
SFTP_USER="${SFTP_USER:-your-username}"
SFTP_PASS="${SFTP_PASS:-your-password}"
SFTP_DIR="${SFTP_DIR:-/public_html}"

echo "Bendigo Phoenix — Build & Deploy"
echo "====================================="

# Step 1: Build
echo "Building site..."
npm run build

if [ ! -d "dist" ]; then
  echo "Build failed — dist folder not found"
  exit 1
fi

echo "Build complete"

# Step 2: Run scraper (optional, comment out if not needed)
# echo "Updating scores..."
# node scripts/scrape-playhq.js

# Step 3: Upload via SFTP
echo "Uploading to VentraIP..."

lftp -c "
set ftp:ssl-allow no;
open -u $SFTP_USER,$SFTP_PASS sftp://$SFTP_HOST;
mirror --reverse --delete --verbose dist/ $SFTP_DIR/;
bye
"

echo ""
echo "Deploy complete! Site is live at https://bendigophoenix.org.au"
