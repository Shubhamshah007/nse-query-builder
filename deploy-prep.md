# NSE QueryBuilder - Deployment Preparation

## 1. Backend Preparation (NestJS)

### Create production environment file
Create `.env.production`:
```env
NODE_ENV=production
PORT=3000
DATABASE_HOST=${DATABASE_HOST}
DATABASE_PORT=${DATABASE_PORT}
DATABASE_USER=${DATABASE_USER}
DATABASE_PASSWORD=${DATABASE_PASSWORD}
DATABASE_NAME=${DATABASE_NAME}
DATABASE_SYNCHRONIZE=false
DATABASE_LOGGING=false
```

### Add deployment scripts to package.json:
```json
{
  "scripts": {
    "start:prod": "node dist/main",
    "build:prod": "nest build",
    "deploy": "npm run build:prod && npm run start:prod"
  }
}
```

### Create Railway deployment file:
Create `railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100
  }
}
```

## 2. Frontend Preparation (React/Vite)

### Update API base URL for production:
In `frontend/src/services/api.ts`:
```typescript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.railway.app' 
  : 'http://localhost:3000';
```

### Build optimization:
```json
{
  "scripts": {
    "build:prod": "vite build --mode production",
    "preview": "vite preview"
  }
}
```

## 3. Database Migration

### Export your MySQL data:
```bash
mysqldump -u root -p option_data > database_backup.sql
```

### Create migration script for production:
Create `migrate-db.js`:
```javascript
// Script to populate production database with sample data
```

## 4. Deployment Checklist

- [ ] Backend builds successfully
- [ ] Frontend builds successfully  
- [ ] Environment variables configured
- [ ] Database schema exported
- [ ] API endpoints tested
- [ ] CORS configured for production domain
- [ ] Production optimizations applied