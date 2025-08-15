# Render Deployment Fix Guide

## Problem
The Render deployment was failing with the error:
```
Cannot find module @rollup/rollup-linux-x64-gnu
```

## Solutions Implemented

### 1. Configuration Files Added
- `.npmrc` - Forces legacy peer deps and disables package-lock
- `render.yaml` - Render configuration with proper build commands
- `build.sh` - Simplified build script
- Updated `.gitignore` to ignore `package-lock.json`

### 2. Package.json Updates
- Added rollup version overrides
- Added resolutions to force specific rollup version

### 3. Vite Config Updates
- Added explicit build options
- Better rollup configuration

## How to Apply to Render

### Option 1: Use render.yaml (Recommended)
1. The `render.yaml` file is automatically detected by Render
2. It will use the new build command that properly handles dependencies

### Option 2: Update Build Command in Render Dashboard
Replace your current build command with:
```bash
rm -rf node_modules package-lock.json && npm install --no-package-lock --legacy-peer-deps && npm run build && cd backend && npm install --production --no-package-lock
```

### Option 3: Use the build script
Set the build command to:
```bash
chmod +x build.sh && ./build.sh
```

## Environment Variables to Set in Render
```
NODE_VERSION=22.16.0
NPM_CONFIG_LEGACY_PEER_DEPS=true
NPM_CONFIG_PACKAGE_LOCK=false
```

## Start Command
Keep your start command as:
```bash
cd backend && node server.js
```

The deployment should now work without the Rollup dependency errors.
