# CORS and Deployment Configuration Guide

## Current Setup Analysis

### Backend Configuration (from your .env)
```env
CORS_ORIGIN=http://localhost:5173          # ✅ Works for local development
CORS_ORIGIN_PROD=https://your-frontend-domain.com  # ❌ Needs to be updated
```

### Frontend Deployment
- **Local Development**: `http://localhost:5173`
- **Production (Vercel)**: `https://student-panel-frontend-eight.vercel.app`

## The CORS Problem

Your backend only allows requests from:
1. `http://localhost:5173` (local development)
2. `https://your-frontend-domain.com` (placeholder, not your actual domain)

But your production frontend is at `https://student-panel-frontend-eight.vercel.app`

## Solutions (Choose One)

### Option 1: Fix Backend CORS (Recommended if you control the backend)

Update your backend's production environment:

```env
# In your backend .env or .env.production
CORS_ORIGIN_PROD=https://student-panel-frontend-eight.vercel.app
```

Then deploy your backend and update frontend to use deployed backend URL.

### Option 2: Deploy Backend (Best for production)

1. **Deploy your backend** to Heroku/Railway/Render
2. **Update frontend production config**:
```env
# .env.production
VITE_API_URL=https://your-deployed-backend.herokuapp.com/api
VITE_MOCK_API=false
```

### Option 3: Use Mock API (Current setup - Good for demos)

Keep current configuration:
- ✅ **Local development**: Uses real backend
- ✅ **Production**: Uses mock API (no CORS issues)

## Current Configuration Status

### Local Development (`.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_MOCK_API=false  # Uses your real backend
```

### Production (`.env.production`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_MOCK_API=true   # Uses mock API (avoids CORS)
```

## Quick Commands

```bash
# Test locally with real backend
npm run dev

# Test locally with mock API
VITE_MOCK_API=true npm run dev

# Build for production (uses .env.production)
npm run build

# Preview production build
npm run preview
```

## Next Steps

1. **For immediate fix**: Current setup works (production uses mock API)
2. **For real backend in production**: 
   - Deploy backend to cloud service
   - Update backend CORS to include Vercel domain
   - Update `.env.production` with deployed backend URL
   - Set `VITE_MOCK_API=false` in production

## Vercel Environment Variables

If you want to override in Vercel dashboard:
- `VITE_API_URL`: Your deployed backend URL
- `VITE_MOCK_API`: `false` (to use real backend)
