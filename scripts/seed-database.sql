-- NSE Query Builder Database Seed Script
-- This script creates the market_summary table and inserts sample data

-- Create the table if it doesn't exist (PostgreSQL syntax)
CREATE TABLE IF NOT EXISTS market_summary (
    symbol VARCHAR(32) PRIMARY KEY,
    current_call_iv FLOAT DEFAULT 0,
    current_put_iv FLOAT DEFAULT 0,
    current_price FLOAT DEFAULT 0,
    yesterday_close_call_iv FLOAT DEFAULT 0,
    today_930_call_iv FLOAT DEFAULT 0,
    sector VARCHAR(50) DEFAULT 'Unknown',
    instrument_type VARCHAR(10) DEFAULT 'STOCK',
    result_month VARCHAR(7),
    similar_results_avg_iv FLOAT DEFAULT 0,
    is_expiry_week BOOLEAN DEFAULT false,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_market_summary_sector ON market_summary(sector);
CREATE INDEX IF NOT EXISTS idx_market_summary_instrument_type ON market_summary(instrument_type);
CREATE INDEX IF NOT EXISTS idx_market_summary_result_month ON market_summary(result_month);

-- Insert sample data
INSERT INTO market_summary (
    symbol, current_call_iv, current_put_iv, current_price, 
    yesterday_close_call_iv, today_930_call_iv, sector, 
    instrument_type, result_month, similar_results_avg_iv, 
    is_expiry_week
) VALUES 
-- High IV stocks with significant changes
('RELIANCE', 25.5, 24.8, 2850.75, 22.3, 23.1, 'Oil & Gas', 'STOCK', 'Dec2024', 23.2, true),
('INFY', 18.9, 19.2, 1456.30, 16.8, 17.5, 'IT Services', 'STOCK', 'Dec2024', 17.8, false),
('HDFC', 21.3, 20.9, 2785.60, 19.5, 20.1, 'Banking', 'STOCK', 'Dec2024', 20.2, true),
('TCS', 16.7, 17.1, 3654.20, 15.2, 15.8, 'IT Services', 'STOCK', 'Dec2024', 16.1, false),
('ICICIBANK', 23.8, 23.2, 1087.45, 21.6, 22.4, 'Banking', 'STOCK', 'Dec2024', 22.1, true),

-- Index options with different IV characteristics
('NIFTY', 19.5, 19.8, 21650.30, 18.2, 18.9, 'Index', 'INDEX', 'Dec2024', 18.7, true),
('BANKNIFTY', 22.1, 21.9, 46875.80, 20.3, 21.2, 'Banking Index', 'INDEX', 'Dec2024', 20.8, true),

-- More stocks across different sectors
('MARUTI', 20.4, 20.1, 10945.25, 18.8, 19.3, 'Automobiles', 'STOCK', 'Dec2024', 19.2, false),
('ASIANPAINT', 17.6, 17.9, 3251.70, 16.1, 16.8, 'Paints & Coatings', 'STOCK', 'Dec2024', 16.9, false),
('ADANIENTS', 28.3, 27.8, 2456.90, 25.7, 26.4, 'Renewable Energy', 'STOCK', 'Dec2024', 26.1, true),

-- Stocks with lower IV for comparison
('WIPRO', 15.2, 15.5, 425.60, 14.1, 14.7, 'IT Services', 'STOCK', 'Dec2024', 14.8, false),
('HCLTECH', 16.8, 17.2, 1789.40, 15.3, 15.9, 'IT Services', 'STOCK', 'Dec2024', 15.7, false),

-- Additional banking stocks
('AXISBANK', 24.7, 24.2, 1134.80, 22.9, 23.6, 'Banking', 'STOCK', 'Dec2024', 23.4, true),
('KOTAKBANK', 19.8, 20.1, 1687.30, 18.4, 19.0, 'Banking', 'STOCK', 'Dec2024', 18.9, false),
('SBIN', 22.5, 22.1, 798.45, 20.7, 21.3, 'Banking', 'STOCK', 'Dec2024', 21.2, true),

-- More diverse sectors
('BHARTIARTL', 18.3, 18.7, 1654.20, 16.9, 17.4, 'Telecom', 'STOCK', 'Dec2024', 17.3, false),
('ONGC', 21.9, 21.5, 487.60, 19.8, 20.5, 'Oil & Gas', 'STOCK', 'Dec2024', 20.3, true)

ON CONFLICT (symbol) DO UPDATE SET
    current_call_iv = EXCLUDED.current_call_iv,
    current_put_iv = EXCLUDED.current_put_iv,
    current_price = EXCLUDED.current_price,
    yesterday_close_call_iv = EXCLUDED.yesterday_close_call_iv,
    today_930_call_iv = EXCLUDED.today_930_call_iv,
    sector = EXCLUDED.sector,
    similar_results_avg_iv = EXCLUDED.similar_results_avg_iv,
    is_expiry_week = EXCLUDED.is_expiry_week,
    last_updated = CURRENT_TIMESTAMP;