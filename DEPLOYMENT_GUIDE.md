# 🚀 Free Deployment Guide for NSE Query Builder

This guide will help you deploy your NSE Query Builder to the web completely free without requiring payment details.

## 📋 Prerequisites

1. GitHub account (free)
2. Railway account (free - no payment details required initially)
3. Vercel account (free - no payment details required)

## 🛤️ Step 1: Deploy Backend to Railway

### 1.1 Push Code to GitHub (if not already done)

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 1.2 Setup Railway

1. Go to [Railway.app](https://railway.app)
2. Sign up with your GitHub account
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `nse-query-builder` repository
5. Railway will automatically detect it's a Node.js project

### 1.3 Configure Environment Variables

In Railway dashboard, go to your project → Variables tab and add:

```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
FRONTEND_URL=https://your-frontend-name.vercel.app
```

**Note**: Railway will automatically provide the `DATABASE_URL` when you add a PostgreSQL database.

### 1.4 Add PostgreSQL Database

1. In Railway dashboard, click "New" → "Database" → "PostgreSQL"
2. Railway will automatically create the database and set `DATABASE_URL`
3. Your backend will now connect to PostgreSQL instead of MySQL

### 1.5 Deploy

Railway will automatically deploy your backend. You'll get a URL like:
`https://your-backend-name.railway.app`

## 🌐 Step 2: Deploy Frontend to Vercel

### 2.1 Setup Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Click "Add New..." → "Project"
4. Import your `nse-query-builder` repository

### 2.2 Configure Build Settings

During import, set these settings:
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 2.3 Set Environment Variables

In Vercel dashboard, go to Project Settings → Environment Variables:

```env
VITE_API_URL=https://your-backend-name.railway.app
```

Replace `your-backend-name.railway.app` with your actual Railway backend URL.

### 2.4 Deploy

Vercel will build and deploy your frontend. You'll get a URL like:
`https://your-frontend-name.vercel.app`

## 🔄 Step 3: Update CORS Settings

1. Go back to Railway dashboard
2. Update the `FRONTEND_URL` environment variable with your actual Vercel URL:
   ```env
   FRONTEND_URL=https://your-actual-frontend-name.vercel.app
   ```
3. Railway will automatically redeploy with the new CORS settings

## 🗄️ Step 4: Setup Database (Optional - For Real Data)

Since you're switching from MySQL to PostgreSQL, you have a few options:

### Option A: Start Fresh (Recommended for Testing)
- Let TypeORM create tables automatically by setting `synchronize: true` temporarily
- The app will work with empty tables and you can test the mock data functionality

### Option B: Migrate Existing Data
- Export your MySQL data
- Convert and import to PostgreSQL
- This is more complex but preserves your existing data

For testing purposes, **Option A** is recommended.

## 🧪 Step 5: Test Your Deployment

1. Visit your Vercel frontend URL
2. Try building a query
3. Check if the frontend communicates with the backend
4. Verify that queries execute (even if returning mock data)

## 📝 Quick Commands Reference

### Test Backend Locally (should still work)
```bash
npm run start:dev
```

### Test Frontend Locally with Production Backend
```bash
cd frontend
VITE_API_URL=https://your-backend-name.railway.app npm run dev
```

### Build Frontend for Production
```bash
cd frontend
npm run build
```

## 🚨 Troubleshooting

### Backend Issues
- Check Railway logs in dashboard
- Verify environment variables are set
- Ensure PostgreSQL database is connected

### Frontend Issues
- Check Vercel build logs
- Verify API URL is correct
- Check browser network tab for CORS errors

### Database Issues
- Railway provides a free PostgreSQL database
- Connection details are automatically set via `DATABASE_URL`
- No manual database setup required

## 🎯 Final URLs

After deployment, you'll have:
- **Backend API**: `https://your-backend-name.railway.app`
- **Frontend App**: `https://your-frontend-name.vercel.app`
- **Database**: Railway PostgreSQL (automatic)

## 💡 Tips

1. **Free Limits**:
   - Railway: 500 hours/month + $5 credit
   - Vercel: Generous free tier for personal projects
   - No payment details required for either

2. **Auto-Deploy**: 
   - Both services auto-deploy when you push to GitHub
   - No manual deployment needed after setup

3. **Logs**:
   - Railway: View logs in dashboard
   - Vercel: View build/runtime logs in dashboard

4. **Custom Domains** (Optional):
   - Both services support custom domains on free tier
   - Perfect for sharing with your team

---

🎉 **Your NSE Query Builder will be live on the web!**

Need help? The deployment configurations are already set up in your project files.