# Deployment Guide

## Environment Configuration

This project uses different environment configurations for different deployment scenarios:

### 1. Local Development
- Uses `.env.local` (not tracked by Git)
- Connects to local backend at `http://localhost:5000`
- Mock API disabled for real backend testing

### 2. Production (Vercel)
- Uses `.env.production`
- Currently configured to use Mock API
- To use real backend, update `VITE_API_URL` and set `VITE_MOCK_API=false`

### 3. Environment Variables

| Variable | Description | Local | Production |
|----------|-------------|--------|------------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` | Your deployed backend URL |
| `VITE_MOCK_API` | Enable/disable mock API | `false` | `true` (until backend is deployed) |
| `VITE_DEV_MODE` | Development mode | `true` | `false` |

## CORS Issue Fix

The CORS error occurs because:
1. Frontend is deployed on Vercel: `https://student-panel-frontend-eight.vercel.app`
2. Backend is running locally: `http://localhost:5000`
3. Browser blocks cross-origin requests

### Solutions:

#### Option 1: Use Mock API (Current)
- Set `VITE_MOCK_API=true` in production
- App works with sample data

#### Option 2: Deploy Backend
1. Deploy your backend to Heroku, Railway, or Render
2. Update `VITE_API_URL` in `.env.production`
3. Set `VITE_MOCK_API=false`

#### Option 3: Fix Backend CORS (If you have access)
Add your Vercel domain to backend CORS configuration:
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://student-panel-frontend-eight.vercel.app'
  ],
  credentials: true
}));
```

## Vercel Environment Variables

In your Vercel dashboard, add these environment variables:
- `VITE_API_URL`: Your backend URL
- `VITE_MOCK_API`: `true` or `false`
- `VITE_DEV_MODE`: `false`

## Quick Commands

```bash
# Local development with real API
npm run dev

# Local development with mock API
VITE_MOCK_API=true npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```
