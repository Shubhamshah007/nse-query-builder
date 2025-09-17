# Deployment Guide

This project consists of two parts:
- **Frontend**: React + Vite application (deployed on Vercel)
- **Backend**: NestJS API (deployed on Render)

## 🚀 Frontend Deployment (Vercel)

### Automatic Deployment
1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the `vercel.json` configuration
3. The build will run: `cd frontend && npm install && npm run build`
4. Output directory: `frontend/dist`

### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from root directory
vercel --prod
```

### Environment Variables (Vercel)
Add these in your Vercel dashboard:
- `VITE_API_URL`: Your backend URL (e.g., `https://your-app.onrender.com`)

## 🛠️ Backend Deployment (Render)

### Automatic Deployment
1. Connect your GitHub repository to Render
2. Use the `render.yaml` configuration file
3. Or manually configure:
   - **Build Command**: `npm install && npm run build:prod`
   - **Start Command**: `npm run start:prod`
   - **Node Version**: 18.x or higher

### Environment Variables (Render)
Configure these in Render dashboard:
- `NODE_ENV`: `production`
- `PORT`: `3000`
- `DATABASE_HOST`: Your database host
- `DATABASE_PORT`: `3306` (for MySQL)
- `DATABASE_USER`: Your database user
- `DATABASE_PASSWORD`: Your database password
- `DATABASE_NAME`: `nse_options_db`

### Database Setup
1. Create a MySQL database on Render (or use external service)
2. Import your database schema
3. Update connection details in environment variables

## 📋 Pre-deployment Checklist

### Frontend
- ✅ All environment variables configured
- ✅ API URLs point to production backend
- ✅ Build runs without errors: `cd frontend && npm run build`
- ✅ No hardcoded localhost URLs

### Backend
- ✅ All environment variables configured
- ✅ Database connection tested
- ✅ CORS configured for frontend domain
- ✅ Build runs without errors: `npm run build:prod`
- ✅ Production start works: `npm run start:prod`

## 🔧 Local Development

### Setup
```bash
# Backend
npm install
npm run start:dev

# Frontend (in new terminal)
cd frontend
npm install
npm run dev
```

### Environment Files
- Copy `.env.example` to `.env` (backend)
- Copy `frontend/.env.example` to `frontend/.env` (frontend)
- Update with your local database credentials

## 🐛 Troubleshooting

### Common Issues
1. **Build fails**: Check Node.js version (use 18.x or higher)
2. **CORS errors**: Verify backend CORS configuration
3. **Database connection**: Check environment variables and network access
4. **Frontend blank page**: Check browser console for API connection errors

### Logs
- **Vercel**: Check deployment logs in Vercel dashboard
- **Render**: Check logs in Render dashboard
- **Local**: Use `npm run start:dev` for detailed backend logs