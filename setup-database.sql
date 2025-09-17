-- Create database
CREATE DATABASE IF NOT EXISTS option_data;
USE option_data;

-- Sample Market Summary data for NSE stocks
-- This will be automatically created by TypeORM, but let's add some sample data

-- Note: TypeORM will auto-create the tables based on entities
-- This script provides sample INSERT statements to run after tables are created

-- Sample data for market_summary table (to be run after TypeORM creates tables)
/*
INSERT INTO market_summary (
    symbol, 
    current_call_iv, 
    current_put_iv, 
    current_price,
    avg_7day_call_iv,
    avg_21day_call_iv,
    avg_90day_call_iv,
    yesterday_close_call_iv,
    yesterday_close_price,
    today_930_call_iv,
    sector,
    instrument_type,
    result_month,
    similar_results_avg_iv,
    is_expiry_week,
    last_updated
) VALUES 
('RELIANCE', 0.2156, 0.2089, 2456.75, 0.1989, 0.2012, 0.1876, 0.2098, 2445.30, 0.2134, 'Oil & Gas', 'STOCK', '2024-12', 0.2034, 0, NOW()),
('TCS', 0.1876, 0.1923, 3987.45, 0.1789, 0.1823, 0.1698, 0.1889, 3976.80, 0.1901, 'Information Technology', 'STOCK', '2024-12', 0.1834, 0, NOW()),
('INFY', 0.1945, 0.1978, 1876.20, 0.1834, 0.1867, 0.1756, 0.1956, 1869.90, 0.1967, 'Information Technology', 'STOCK', '2024-12', 0.1889, 0, NOW()),
('HDFCBANK', 0.1678, 0.1701, 1634.85, 0.1589, 0.1612, 0.1534, 0.1689, 1628.75, 0.1693, 'Banking', 'STOCK', '2024-12', 0.1623, 0, NOW()),
('ICICIBANK', 0.1789, 0.1823, 1245.60, 0.1678, 0.1712, 0.1598, 0.1798, 1239.25, 0.1812, 'Banking', 'STOCK', '2024-12', 0.1734, 0, NOW()),
('SBIN', 0.2123, 0.2156, 789.45, 0.1989, 0.2034, 0.1876, 0.2134, 785.20, 0.2145, 'Banking', 'STOCK', '2024-12', 0.2067, 0, NOW()),
('NIFTY', 0.1456, 0.1489, 19876.75, 0.1334, 0.1367, 0.1245, 0.1467, 19834.50, 0.1478, 'NIFTY', 'INDEX', '2024-12', 0.1398, 1, NOW()),
('BANKNIFTY', 0.1789, 0.1823, 45678.90, 0.1645, 0.1689, 0.1534, 0.1801, 45234.60, 0.1834, 'BANKNIFTY', 'INDEX', '2024-12', 0.1723, 1, NOW());
*/

-- Show tables after creation
SHOW TABLES;

-- Show database info
SELECT 'Database setup complete!' as Status;