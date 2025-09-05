# Full-Stack Development Guide

## 🎉 Setup Complete!

Your project now has both frontend and backend integrated in a monorepo structure:

```
Student_panel_frontend/
├── Student_panel_backend/          # Backend API server
│   ├── src/                       # Backend source code
│   ├── .env                       # Backend configuration
│   └── package.json               # Backend dependencies
├── src/                           # Frontend React app
├── .env                           # Frontend configuration
├── .env.production                # Production environment
└── package.json                   # Frontend dependencies + scripts
```

## 🚀 Available Commands

### Development (Full-Stack on Vercel)
```bash
npm run dev               # Start Vercel dev server with API routes (RECOMMENDED)
npm run dev:full          # Same as above - full-stack Vercel development
```

### Legacy Development (Separate Frontend/Backend)
```bash
npm run dev:frontend      # Frontend only (http://localhost:5173)
npm run dev:backend       # Backend only (http://localhost:5000)  
npm run dev:legacy        # Both services separately (old method)
```

### Deployment
```bash
npm run build            # Build frontend for production
npm run deploy           # Deploy to Vercel with API routes
npm run preview          # Preview production build locally
```

## 🔧 Configuration Status

### ✅ CORS Fixed
- **Local Development**: `http://localhost:5173` ✅
- **Production (Vercel)**: `https://student-panel-frontend-eight.vercel.app` ✅

### ✅ Environment Setup
- **Local**: Uses real backend API (`VITE_MOCK_API=false`)
- **Production**: Uses mock API (`VITE_MOCK_API=true`) until backend is deployed

## 🌐 Current Setup

### Vercel Full-Stack (.env for Vercel)
```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://...

# JWT Configuration  
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Environment
NODE_ENV=production
```

### Local Development (.env.local)
```env
VITE_API_URL=http://localhost:3000/api  # Vercel dev server
VITE_MOCK_API=false                     # Uses Vercel API routes
VITE_DEV_MODE=true
```

## 🎯 Next Steps

### For Local Development
1. **Start both services**: `npm run dev:full`
2. **Frontend**: http://localhost:5173
3. **Backend**: http://localhost:5000
4. **Test the integration** - No more CORS errors!

### For Production Deployment
1. **Deploy Backend** to Heroku/Railway/Render
2. **Update .env.production**:
   ```env
   VITE_API_URL=https://your-backend-url.com/api
   VITE_MOCK_API=false
   ```
3. **Redeploy frontend** to Vercel

### Quick Test
```bash
# Test if backend is working
curl http://localhost:5000/api/health

# Start full development environment
npm run dev:full
```

## 🔍 Troubleshooting

### Port Conflicts
- Frontend: 5173 (Vite default)
- Backend: 5000 (Express default)

### Database Connection
- Ensure MongoDB cluster is accessible
- Check `MONGODB_URI` in backend `.env`

### CORS Issues
- ✅ Fixed for your current Vercel domain
- If you change domains, update `CORS_ORIGIN_PROD`

## 📁 Project Structure Benefits

- ✅ **Unified Development**: Run both services with one command
- ✅ **Shared Configuration**: Environment variables in one place
- ✅ **Version Control**: Track frontend/backend changes together
- ✅ **CORS Resolved**: Backend configured for your deployment
- ✅ **Easy Deployment**: Both projects ready for production

Happy coding! 🚀
