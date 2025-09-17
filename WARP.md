# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Project Setup
```bash
npm install
```

### Development Server
```bash
# Start in development mode with hot reload
npm run start:dev

# Start in debug mode with hot reload
npm run start:debug

# Start in production mode
npm run start:prod
```

### Building
```bash
# Build the project
npm run build
```

### Testing
```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run e2e tests
npm run test:e2e

# Run tests with coverage
npm run test:cov

# Debug tests
npm run test:debug
```

### Code Quality
```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format
```

## Architecture Overview

### Application Structure
This is a **NestJS REST API** for NSE (National Stock Exchange) stock data analysis and querying. The application follows a modular architecture with clear separation of concerns.

### Core Modules
- **StocksModule**: Manages stock master data (symbols, company names, sectors)
- **PriceDataModule**: Handles daily OHLCV price data for stocks
- **AnalyticsModule**: Provides technical analysis and market indicators
- **QueryBuilderModule**: Custom query building functionality (placeholder)

### Database Architecture
- **Database**: MySQL (`option_data`)
- **ORM**: TypeORM with entity-based approach
- **Key Entities**:
  - `Stock`: Master data (symbol, company name, sector, market cap) [Legacy]
  - `PriceData`: Daily OHLCV data with volume and technical fields [Legacy]
  - `MarketIndex`: Market indices information [Legacy]
  - `IndexData`: Index historical data [Legacy]
  - `LatestData`: Current underlying prices and expiry data (214 records)
  - `LiveInstrumentData`: Real-time instrument metadata
  - `LiveOptionStrikes`: Complete options chain with Greeks (40,110+ records)
  - `MarketSummary`: IV analytics and sector performance data

### Entity Relationships
- `Stock` ↔ `PriceData`: One-to-many (one stock has many price records)
- Proper indexing on frequently queried fields (symbol, date, volume)
- UUID primary keys with optimized composite indexes

### Key Features Implemented
- **Moving Averages**: 14-day, 21-day, and 50-day calculations
- **Technical Indicators**: Price changes, volume analysis, VWAP
- **Market Analytics**: Top performers, sector performance analysis
- **Data Averaging**: Supports 14-day and 21-day averages (per user preference)

### New Options Trading API Endpoints
- **GET /options/symbols**: Get all available symbols (214 symbols)
- **GET /options/chain/:symbol**: Get complete options chain with strikes, LTP, OI, IV
- **GET /options/iv-analysis/:symbol**: Implied volatility analysis with historical trends
- **GET /options/high-iv**: Top stocks by implied volatility
- **GET /options/atm/:symbol**: At-the-money option strikes
- **GET /options/sector-iv-analysis**: Sector-wise IV analysis

### Advanced Query Builder API Endpoints
- **GET /query-builder/available-queries**: Get all available advanced queries with documentation
- **GET /query-builder/current-iv-gt-3months**: Stocks with Current IV > 3 months avg (exclude expiry week)
- **GET /query-builder/current-iv-gt-1week**: Stocks with Current IV > 1 week avg (exclude expiry week)
- **GET /query-builder/current-iv-gt-yesterday-10percent**: Stocks with Current IV > 10% of yesterday's IV
- **GET /query-builder/current-iv-gt-today930-10percent**: Stocks with Current IV > 10% of today's 9:30 AM IV
- **GET /query-builder/sector-wise-iv**: Sector-wise IV analysis with top stocks
- **GET /query-builder/similar-result-avg-gt-current**: Stocks where similar result avg IV > current IV
- **GET /query-builder/similar-result-avg-lt-current**: Stocks where similar result avg IV < current IV
- **GET /query-builder/this-month-results-high-iv**: This month results with high current IV vs historical
- **GET /query-builder/index-current-iv-gt-weekly**: Indices with current IV > weekly avg
- **GET /query-builder/index-current-iv-lt-weekly**: Indices with current IV < weekly avg
- **GET /query-builder/available-sectors**: Get all available sectors for filtering

### Configuration
- Environment-driven configuration via `@nestjs/config`
- Database settings configurable via environment variables:
  - `DATABASE_HOST`: MySQL host (default: localhost)
  - `DATABASE_PORT`: MySQL port (default: 3306)
  - `DATABASE_USER`: MySQL username (default: root)
  - `DATABASE_PASSWORD`: MySQL password (default: empty)
  - `DATABASE_NAME`: Database name (default: `option_data`)
  - `DATABASE_SYNCHRONIZE`: Auto-sync schema (default: false)
  - `DATABASE_LOGGING`: Enable SQL logging (default: false)
  - `PORT`: Application port (default: 3000)

### TypeScript Configuration
- **Target**: ES2023 with modern module resolution
- **Decorators**: Enabled for NestJS dependency injection
- **Strict mode**: Partially enabled (some strict checks disabled for flexibility)

### Code Quality Setup
- **ESLint**: TypeScript-aware with Prettier integration
- **Prettier**: Consistent code formatting
- **Jest**: Unit and e2e testing with coverage reporting

### Development Notes
- **Options Trading Focus**: Application now serves live options data with Greeks (Delta, Theta, Gamma, Vega)
- **Real-time Data**: 40,110+ live option strikes with Call/Put LTP, OI, Volume, and IV
- **Advanced Query Builder**: 11 sophisticated IV comparison queries for professional trading analysis
- **IV Analytics**: Supports 7-day, 21-day, 90-day implied volatility trend analysis with percentage changes
- **Performance Optimized**: Custom SQL queries for complex IV comparisons and sector analysis
- **Greeks Calculation**: Full options Greeks available for risk management
- **Sector Analysis**: IV analytics grouped by sectors with top stock identification
- **Expiry Week Filtering**: Sophisticated filtering to exclude expiry week distortions
- **Result Month Analysis**: Historical similar result patterns for earnings/event analysis
- **Index vs Stock Separation**: Dedicated queries for index vs individual stock IV analysis
- **MySQL Backend**: Migrated from SQLite to MySQL for better concurrent access
- **Query Optimization**: Proper indexing on symbol, strike, date, and sector fields
