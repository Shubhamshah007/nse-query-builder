# LiveOptionStrikes Table Integration

## 🎯 **Overview**

The `live_option_strikes` table has been integrated into the QueryBuilder system to support future advanced options queries. While no queries are currently implemented for this table, the infrastructure is ready for complex joins and analysis.

---

## 📊 **Database Schema: `live_option_strikes`**

```sql
+---------------+-------------+------+-----+---------+----------------+
| Field         | Type        | Null | Key | Default | Extra          |
+---------------+-------------+------+-----+---------+----------------+
| id            | int         | NO   | PRI | NULL    | auto_increment |
| instrument_id | int         | YES  |     | NULL    |                |
| symbol        | varchar(32) | NO   |     | NULL    |                |
| strike        | double      | NO   |     | NULL    |                |
| call_ltp      | double      | YES  |     | 0       |                |
| call_volume   | bigint      | YES  |     | 0       |                |
| call_iv       | double      | YES  |     | 0       |                |
| call_delta    | double      | YES  |     | 0       |                |
| call_theta    | double      | YES  |     | 0       |                |
| call_gamma    | double      | YES  |     | 0       |                |
| call_vega     | double      | YES  |     | 0       |                |
| put_ltp       | double      | YES  |     | 0       |                |
| put_volume    | bigint      | YES  |     | 0       |                |
| put_iv        | double      | YES  |     | 0       |                |
| put_delta     | double      | YES  |     | 0       |                |
| put_theta     | double      | YES  |     | 0       |                |
| put_gamma     | double      | YES  |     | 0       |                |
| put_vega      | double      | YES  |     | 0       |                |
| Date          | date        | NO   |     | NULL    |                |
| Time          | time        | NO   |     | NULL    |                |
| is_atm        | tinyint(1)  | NO   |     | 0       |                |
| expiry        | varchar(32) | YES  |     | NULL    |                |
+---------------+-------------+------+-----+---------+----------------+
```

---

## 🏗️ **Infrastructure Added**

### 1. **LiveOptionStrikes Entity**
```typescript
@Entity('live_option_strikes')
@Index(['symbol'])
@Index(['Date'])
@Index(['expiry'])
@Index(['is_atm'])
@Index(['symbol', 'Date'])
@Index(['symbol', 'expiry'])
export class LiveOptionStrikes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 32, name: 'symbol' })
  symbol: string;

  @Column('double', { name: 'strike' })
  strike: number;

  @Column('double', { default: 0, nullable: true, name: 'call_iv' })
  callIv?: number;

  @Column('double', { default: 0, nullable: true, name: 'put_iv' })
  putIv?: number;

  // ... all other fields mapped
}
```

### 2. **OptionStrikeField Enum**
```typescript
export enum OptionStrikeField {
  STRIKE = 'strike',
  CALL_LTP = 'call_ltp',
  CALL_VOLUME = 'call_volume',
  CALL_IV = 'call_iv',
  CALL_DELTA = 'call_delta',
  CALL_THETA = 'call_theta',
  CALL_GAMMA = 'call_gamma',
  CALL_VEGA = 'call_vega',
  PUT_LTP = 'put_ltp',
  PUT_VOLUME = 'put_volume',
  PUT_IV = 'put_iv',
  PUT_DELTA = 'put_delta',
  PUT_THETA = 'put_theta',
  PUT_GAMMA = 'put_gamma',
  PUT_VEGA = 'put_vega',
  IS_ATM = 'is_atm',
  EXPIRY = 'expiry',
}
```

### 3. **Updated Module Configuration**
- ✅ Entity registered in `app.module.ts`
- ✅ Repository available in `QueryBuilderModule`
- ✅ TypeORM configuration updated

---

## 🔗 **Join Relationship**

### **Primary Join Key:**
```sql
market_summary.symbol = live_option_strikes.symbol
```

### **Sample Join Query:**
```sql
SELECT 
  ms.symbol,
  ms.current_call_iv,
  los.strike,
  los.call_iv,
  los.put_iv,
  los.is_atm
FROM market_summary ms
INNER JOIN live_option_strikes los ON ms.symbol = los.symbol
WHERE los.Date = CURDATE()
  AND ms.instrument_type = 'STOCK'
```

---

## 🚀 **Future Query Examples (Ready for Implementation)**

### 1. **High Volume IV Spikes**
**Endpoint:** `GET /query-builder/future/high-volume-iv-spikes`

**Purpose:** Find stocks with high option volume AND IV spikes

```sql
SELECT 
  ms.symbol,
  ms.sector,
  ms.current_call_iv,
  AVG(los.call_volume + los.put_volume) as totalVolume,
  AVG(los.call_iv) as avgCallIvStrikes,
  COUNT(los.id) as strikeCount
FROM market_summary ms
INNER JOIN live_option_strikes los ON ms.symbol = los.symbol
WHERE ms.current_call_iv > ms.similar_results_avg_iv * 1.2
  AND los.Date = CURDATE()
  AND (los.call_volume > 1000 OR los.put_volume > 1000)
  AND ms.instrument_type = 'STOCK'
GROUP BY ms.symbol, ms.sector, ms.current_call_iv
HAVING totalVolume > 5000
ORDER BY totalVolume DESC, ms.current_call_iv DESC
```

### 2. **ATM Options Analysis**
**Endpoint:** `GET /query-builder/future/atm-options-analysis`

**Purpose:** Analyze At-The-Money options with current IV comparison

```sql
SELECT 
  ms.symbol,
  ms.current_price,
  ms.current_call_iv,
  los.strike,
  los.call_ltp,
  los.put_ltp,
  los.call_iv as atmCallIv,
  los.put_iv as atmPutIv,
  los.expiry,
  ABS(ms.current_price - los.strike) as priceStrikeDiff
FROM market_summary ms
INNER JOIN live_option_strikes los ON ms.symbol = los.symbol
WHERE los.is_atm = 1
  AND los.Date = CURDATE()
  AND ms.instrument_type = 'STOCK'
ORDER BY ms.current_call_iv DESC, los.call_volume DESC
```

### 3. **Greeks-based Analysis**
**Endpoint:** `GET /query-builder/future/high-delta-gamma-options`

**Purpose:** Find options with high delta and gamma (risk analysis)

```sql
SELECT 
  ms.symbol,
  ms.current_call_iv,
  los.strike,
  los.call_delta,
  los.call_gamma,
  los.put_delta,
  los.put_gamma,
  (los.call_delta * los.call_gamma) as callRisk,
  (ABS(los.put_delta) * los.put_gamma) as putRisk
FROM market_summary ms
INNER JOIN live_option_strikes los ON ms.symbol = los.symbol
WHERE los.Date = CURDATE()
  AND ms.instrument_type = 'STOCK'
  AND los.call_delta > 0.5
  AND los.call_gamma > 0.01
ORDER BY callRisk DESC, ms.current_call_iv DESC
```

---

## 🎯 **Potential Future Query Types**

### **Volume-based Queries:**
- High put/call volume ratio analysis
- Volume spikes at specific strikes
- Unusual activity detection

### **Greeks-based Queries:**
- Delta hedging opportunities
- Gamma scalping candidates
- High vega sensitivity analysis
- Time decay (theta) analysis

### **Strike-based Queries:**
- Support/resistance level analysis based on high volume strikes
- Pin risk analysis (strikes with high open interest)
- Strike skew analysis

### **Time-based Queries:**
- Expiry-wise IV analysis
- Intraday volume patterns
- Pre/post earnings analysis

### **Cross-table Analytics:**
- Compare live option IV vs market summary IV
- Volume vs price movement correlation
- IV term structure analysis

---

## 📋 **Implementation Checklist**

### ✅ **Completed:**
- [x] LiveOptionStrikes entity created
- [x] Database indexes optimized for joins
- [x] Module configuration updated  
- [x] TypeORM repository available
- [x] Field enums defined
- [x] Sample query methods implemented
- [x] Controller endpoints prepared
- [x] Join syntax validated

### 🔄 **Ready for Future Development:**
- [ ] Activate specific query endpoints as needed
- [ ] Add dynamic query support for option strikes
- [ ] Implement real-time data filtering
- [ ] Add advanced aggregations (term structure, skew)
- [ ] Create custom result interfaces for complex queries

---

## 🚀 **Usage When Ready**

### **Test Join Capability:**
```bash
# Check data availability
GET /query-builder/future/high-volume-iv-spikes

# ATM analysis
GET /query-builder/future/atm-options-analysis

# Greeks analysis  
GET /query-builder/future/high-delta-gamma-options
```

### **Schema Information:**
```bash
GET /query-builder/dynamic/schema
# Now includes optionStrikeFields array
```

---

## 🎯 **Key Benefits**

### **Ready Infrastructure:**
- ✅ **No setup required** when you want to create option queries
- ✅ **Optimized indexes** for fast joins on symbol, date, expiry
- ✅ **Type-safe entities** with all fields mapped
- ✅ **Repository injection** already configured

### **Flexible Query Patterns:**
- ✅ **Complex joins** between market summary and live strikes
- ✅ **Greeks-based filtering** (delta, gamma, theta, vega)
- ✅ **Volume analysis** with call/put breakdown
- ✅ **Time-based analysis** with date/expiry filtering

### **Scalable Architecture:**
- ✅ **Easy to extend** with new query types
- ✅ **Consistent patterns** following existing QueryBuilder structure  
- ✅ **Database optimized** for high-performance queries

Your system is now **fully prepared** for advanced options analysis queries! 🚀