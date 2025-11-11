# Deployment Guide - Option A: Static Site

This guide explains how to deploy the frontend as a **static site** on Render (or any static hosting) with a separate backend.

## Overview

- **Frontend**: Next.js static export (`output: 'export'`) - no API routes included
- **Backend**: Separate deployment (e.g., Render Web Service, Railway, Fly.io)
- **Communication**: Frontend calls backend via `NEXT_PUBLIC_API_BASE` environment variable

## Prerequisites

1. Backend is deployed and accessible (e.g., `https://your-backend.onrender.com`)
2. Backend has CORS configured to allow requests from frontend domain
3. Git repository connected to Render

## Step 1: Configure Backend URL

### Local Development

Create `.env.local` (not committed to git):

```env
NEXT_PUBLIC_API_BASE=http://localhost:8081
```

### Production (Render Static Site)

Set environment variable in Render Dashboard:
- Key: `NEXT_PUBLIC_API_BASE`
- Value: `https://your-backend.onrender.com`

## Step 2: Verify next.config.mjs

Ensure `next.config.mjs` has the following settings:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',            // Static export
  images: { unoptimized: true }, // No Image Optimization API
  trailingSlash: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
```

✅ **Already configured correctly**

## Step 3: Deploy on Render (Static Site)

### Create New Static Site

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Static Site"**
3. Connect your Git repository
4. Configure the following:

| Setting | Value |
|---------|-------|
| **Name** | `dal-ai-frontend` (or your choice) |
| **Branch** | `main` |
| **Build Command** | `pnpm install --no-frozen-lockfile && pnpm run build` |
| **Publish Directory** | `out` |

### Environment Variables

Add in Render Dashboard → Environment tab:

```
NEXT_PUBLIC_API_BASE=https://your-backend.onrender.com
```

⚠️ **Important**: Replace with your actual backend URL!

### Auto-Deploy

Render will automatically:
1. Install dependencies with pnpm
2. Build static site (`next build` → creates `out/` directory)
3. Serve files from `out/` directory

## Step 4: Verify Deployment

After deployment completes:

1. Visit your static site URL (e.g., `https://dal-ai-frontend.onrender.com`)
2. Open browser DevTools → Network tab
3. Check that API calls go to your backend URL
4. Test authentication and API features

### Expected Network Requests

All API calls should look like:
```
https://your-backend.onrender.com/api/auth/me
https://your-backend.onrender.com/api/memory/global
https://your-backend.onrender.com/api/documents/upload
```

## Step 5: Backend CORS Configuration

Your backend must allow requests from the frontend domain:

```javascript
// Example Express.js CORS config
const cors = require('cors');

app.use(cors({
  origin: [
    'https://dal-ai-frontend.onrender.com', // Production frontend
    'http://localhost:3000',                 // Local development
  ],
  credentials: true, // Allow cookies for authentication
}));
```

## Troubleshooting

### API Calls Fail with CORS Error

**Problem**: Browser blocks requests due to CORS policy

**Solution**: 
- Add frontend domain to backend's CORS allowed origins
- Ensure `credentials: 'include'` is set in fetch calls (already configured)
- Check that backend sends `Access-Control-Allow-Origin` header

### Environment Variable Not Working

**Problem**: API calls still go to `localhost` or wrong URL

**Solution**:
- Verify `NEXT_PUBLIC_API_BASE` is set in Render Dashboard
- Trigger a new deployment (change may require rebuild)
- Check browser console for the API URL being used

### 404 Errors on Direct URL Access

**Problem**: Refreshing page shows 404 error

**Solution**:
- Ensure `trailingSlash: true` in `next.config.mjs` (already set)
- Static hosting should serve `index.html` for each route
- Render handles this automatically for Next.js static exports

### Build Fails

**Problem**: Build command fails on Render

**Solution**:
- Check build logs in Render Dashboard
- Verify `pnpm` is available (Render supports it natively)
- Try local build: `pnpm run build` and fix any errors

## Alternative: Local Build & Deploy

If you prefer to build locally and deploy pre-built files:

```bash
# Build locally
pnpm run build

# Deploy the 'out' directory to any static host
# - Netlify: drag & drop 'out' folder
# - Vercel: vercel deploy --prebuilt
# - AWS S3: aws s3 sync out/ s3://your-bucket/
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│  User Browser                                   │
│  https://dal-ai-frontend.onrender.com          │
└──────────────────┬──────────────────────────────┘
                   │
                   │ Fetch API calls with
                   │ NEXT_PUBLIC_API_BASE
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  Backend API                                    │
│  https://your-backend.onrender.com             │
│  - /api/auth/me                                 │
│  - /api/memory/global                           │
│  - /api/documents/upload                        │
│  - etc.                                         │
└─────────────────────────────────────────────────┘
```

## Benefits of This Approach

✅ **Fast**: Static files served from CDN  
✅ **Scalable**: No server-side rendering overhead  
✅ **Cheap**: Static hosting is often free or very cheap  
✅ **Simple**: Just HTML/CSS/JS files  
✅ **Secure**: Backend handles all sensitive operations  

## Next Steps

1. ✅ Configure `NEXT_PUBLIC_API_BASE`
2. ✅ Deploy to Render Static Site
3. ✅ Update backend CORS settings
4. ✅ Test all features
5. 🎉 Done!

---

**Questions?** Check Render documentation or open an issue.
