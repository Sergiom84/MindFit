#!/bin/bash
set -e

echo "🧹 Cleaning up old builds..."
rm -rf node_modules package-lock.json dist

echo "📦 Installing dependencies..."
npm install --no-package-lock --legacy-peer-deps --include=dev

echo "🔨 Building frontend..."
npm run build

echo "📦 Installing backend dependencies..."
cd backend
rm -rf node_modules package-lock.json
npm install --no-package-lock --production

echo "✅ Build complete!"
