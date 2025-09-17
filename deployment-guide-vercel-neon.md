# NSE QueryBuilder - Vercel + Neon + Railway Deployment

## 🎯 Architecture
- **Frontend**: Vercel (React/Vite)
- **Backend**: Railway (NestJS)  
- **Database**: Neon (PostgreSQL)

## 📋 Step-by-Step Deployment

### Phase 1: Database Migration (MySQL → PostgreSQL)

#### 1.1 Export Current Data
```bash
# Export your current MySQL data structure
mysqldump -u root -p --no-data option_data > schema.sql
mysqldump -u root -p --no-create-info option_data > data.sql
```

#### 1.2 Convert MySQL to PostgreSQL
Create `migrate-to-postgres.sql`:
```sql
-- Convert your MySQL schema to PostgreSQL
-- market_summary table
CREATE TABLE market_summary (
    symbol VARCHAR(32) PRIMARY KEY,
    current_call_iv DOUBLE PRECISION DEFAULT 0,
    current_put_iv DOUBLE PRECISION DEFAULT 0,
    current_price DOUBLE PRECISION DEFAULT 0,
    yesterday_close_call_iv DOUBLE PRECISION DEFAULT 0,
    yesterday_close_price DOUBLE PRECISION DEFAULT 0,
    today_930_call_iv DOUBLE PRECISION DEFAULT 0,
    sector VARCHAR(50) DEFAULT 'Unknown',
    instrument_type instrument_type_enum DEFAULT 'STOCK',
    result_month VARCHAR(7),
    similar_results_avg_iv DOUBLE PRECISION DEFAULT 0,
    is_expiry_week BOOLEAN DEFAULT false,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create enum for instrument_type
CREATE TYPE instrument_type_enum AS ENUM ('STOCK', 'INDEX');

-- nse_vol table (for dynamic queries)
CREATE TABLE nse_vol (
    entry_number SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    instrument_id VARCHAR(256),
    symbol VARCHAR(256),
    time TIME NOT NULL,
    expiry_date VARCHAR(30),
    equity VARCHAR(10),
    spot VARCHAR(10),
    s_high VARCHAR(10),
    s_low VARCHAR(10),
    s_open VARCHAR(10),
    s_close VARCHAR(10),
    atm FLOAT NOT NULL,
    atm_price FLOAT,
    atm_vol FLOAT,
    days_of_expire VARCHAR(10),
    volume FLOAT NOT NULL,
    delta FLOAT,
    vega FLOAT,
    theta FLOAT,
    gamma FLOAT
);

-- Create indexes for performance
CREATE INDEX idx_market_summary_sector ON market_summary(sector);
CREATE INDEX idx_market_summary_instrument_type ON market_summary(instrument_type);
CREATE INDEX idx_nse_vol_date ON nse_vol(date);
CREATE INDEX idx_nse_vol_atm_vol ON nse_vol(atm_vol);
```

### Phase 2: Backend Configuration

#### 2.1 Update TypeORM for PostgreSQL
Update `app.module.ts`:
```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [MarketSummary, /* other entities */],
  synchronize: false,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})
```

#### 2.2 Install PostgreSQL Driver
```bash
npm install pg @types/pg
npm uninstall mysql2
```

#### 2.3 Environment Variables (.env.production)
```env
NODE_ENV=production
PORT=3000
DATABASE_HOST=${DATABASE_HOST}
DATABASE_PORT=5432
DATABASE_USER=${DATABASE_USER}
DATABASE_PASSWORD=${DATABASE_PASSWORD}
DATABASE_NAME=${DATABASE_NAME}
DATABASE_SYNCHRONIZE=false
DATABASE_LOGGING=false
```

### Phase 3: Frontend Configuration

#### 3.1 Update API Configuration
In `frontend/src/services/api.ts`:
```typescript
const API_BASE_URL = import.meta.env.PROD 
  ? import.meta.env.VITE_API_URL || 'https://your-backend.railway.app'
  : 'http://localhost:3000';
```

#### 3.2 Environment Variables
Create `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend.railway.app
```

#### 3.3 Build Configuration
Update `frontend/package.json`:
```json
{
  "scripts": {
    "build": "vite build",
    "build:prod": "vite build --mode production"
  }
}
```

### Phase 4: Deployment Steps

#### 4.1 Deploy Database (Neon)
1. Go to [console.neon.tech](https://console.neon.tech)
2. Create free account
3. Create new project: "nse-querybuilder"
4. Copy connection string
5. Run migration SQL in Neon console

#### 4.2 Deploy Backend (Railway)
1. Go to [railway.app](https://railway.app)
2. Create account, connect GitHub
3. Create new project from GitHub repo
4. Set environment variables:
   - `DATABASE_HOST`: [from Neon]
   - `DATABASE_PORT`: 5432
   - `DATABASE_USER`: [from Neon]
   - `DATABASE_PASSWORD`: [from Neon]
   - `DATABASE_NAME`: [from Neon]
5. Deploy automatically

#### 4.3 Deploy Frontend (Vercel)
1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Set build settings:
   - Framework: Vite
   - Build command: `cd frontend && npm run build`
   - Output directory: `frontend/dist`
4. Set environment variable:
   - `VITE_API_URL`: [Railway backend URL]
5. Deploy

### Phase 5: Data Population

#### 5.1 Populate Sample Data
Create script to populate PostgreSQL with your sample data:
```javascript
// populate-db.js
const { Client } = require('pg');

const sampleData = [
  { symbol: 'RELIANCE', sector: 'Oil & Gas', current_call_iv: 18.5, /* ... */ },
  { symbol: 'TCS', sector: 'IT Services', current_call_iv: 15.3, /* ... */ },
  // ... rest of your sample data
];

async function populateDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  await client.connect();
  
  for (const stock of sampleData) {
    await client.query(`
      INSERT INTO market_summary (symbol, sector, current_call_iv, /* ... */)
      VALUES ($1, $2, $3, /* ... */)
    `, [stock.symbol, stock.sector, stock.current_call_iv, /* ... */]);
  }
  
  await client.end();
}

populateDatabase().catch(console.error);
```

## ✅ Deployment Checklist

- [ ] PostgreSQL migration script ready
- [ ] Neon database created and configured
- [ ] Backend updated for PostgreSQL
- [ ] Railway deployment configured
- [ ] Frontend build optimized
- [ ] Vercel deployment configured
- [ ] Environment variables set
- [ ] Sample data populated
- [ ] API endpoints tested
- [ ] Frontend-backend integration verified

## 🚀 Expected Result

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.railway.app`  
- **Database**: Neon PostgreSQL (3GB free)
- **Cost**: $0/month
- **Performance**: Excellent (global CDN + fast DB)