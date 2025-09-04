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

### Development (Run both services)
```bash
npm run dev:full          # Start both frontend (5173) and backend (5000)
```

### Individual Services
```bash
npm run dev              # Frontend only (http://localhost:5173)
npm run dev:backend      # Backend only (http://localhost:5000)
```

### Installation
```bash
npm run install:all      # Install both frontend and backend dependencies
npm run install:backend  # Install backend dependencies only
```

### Production
```bash
npm run build            # Build frontend for production
npm run preview          # Preview production build
```

## 🔧 Configuration Status

### ✅ CORS Fixed
- **Local Development**: `http://localhost:5173` ✅
- **Production (Vercel)**: `https://student-panel-frontend-eight.vercel.app` ✅

### ✅ Environment Setup
- **Local**: Uses real backend API (`VITE_MOCK_API=false`)
- **Production**: Uses mock API (`VITE_MOCK_API=true`) until backend is deployed

## 🌐 Current Setup

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_MOCK_API=false         # Uses real backend locally
VITE_DEV_MODE=true
```

### Backend (.env)
```env
PORT=5000
CORS_ORIGIN=http://localhost:5173                           # Local development
CORS_ORIGIN_PROD=https://student-panel-frontend-eight.vercel.app  # Production
MONGODB_URI=mongodb+srv://...                               # Database connection
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
