# NSE Query Builder API Testing Guide

**Backend URL**: `https://nse-query-builder-backend.onrender.com`

## 🚀 Quick Health Check

```bash
# Check if backend is alive
curl -X GET "https://nse-query-builder-backend.onrender.com/query-builder/available-queries"
```

## 📋 **Postman Collection**

Import the `NSE_QueryBuilder_Postman_Collection.json` file into Postman for complete API testing.

## 🔧 **Manual cURL Commands**

### 1. Health Check & Documentation

```bash
# Get all available queries (Health Check)
curl -X GET "https://nse-query-builder-backend.onrender.com/query-builder/available-queries"

# Get available sectors
curl -X GET "https://nse-query-builder-backend.onrender.com/query-builder/available-sectors"

# Test POST endpoint
curl -X POST "https://nse-query-builder-backend.onrender.com/query-builder/test" \
  -H "Content-Type: application/json" \
  -d '{"test": "Hello from cURL", "timestamp": "2025-01-17T20:14:55Z"}'
```

### 2. Simple Query Builder (Main Frontend Endpoint)

```bash
# Field to Field comparison
curl -X POST "https://nse-query-builder-backend.onrender.com/query-builder/execute" \
  -H "Content-Type: application/json" \
  -d '[{"field1": "current_call_iv", "operator": "gt", "field2": "similar_results_avg_iv"}]'

# Field to Value comparison (should return data)
curl -X POST "https://nse-query-builder-backend.onrender.com/query-builder/execute" \
  -H "Content-Type: application/json" \
  -d '[{"field1": "current_call_iv", "operator": "gt", "value": 25}]'

# High value test (should return empty array)
curl -X POST "https://nse-query-builder-backend.onrender.com/query-builder/execute" \
  -H "Content-Type: application/json" \
  -d '[{"field1": "current_call_iv", "operator": "gt", "value": 999999}]'

# Less than query
curl -X POST "https://nse-query-builder-backend.onrender.com/query-builder/execute" \
  -H "Content-Type: application/json" \
  -d '[{"field1": "current_call_iv", "operator": "lt", "value": 50}]'
```

### 3. Pre-built IV Analysis Queries

```bash
# Current IV > 3 months average
curl -X GET "https://nse-query-builder-backend.onrender.com/query-builder/current-iv-gt-3months"

# Current IV > 1 week average  
curl -X GET "https://nse-query-builder-backend.onrender.com/query-builder/current-iv-gt-1week"

# Current IV > Yesterday + 10%
curl -X GET "https://nse-query-builder-backend.onrender.com/query-builder/current-iv-gt-yesterday-10percent"

# Sector-wise analysis
curl -X GET "https://nse-query-builder-backend.onrender.com/query-builder/sector-wise-iv?sectors=Banking,IT%20Services,Oil%20%26%20Gas"
```

### 4. Dynamic Queries

```bash
# Dynamic 14-day comparison
curl -X GET "https://nse-query-builder-backend.onrender.com/query-builder/dynamic-iv-comparison/14?operator=gt"

# Current IV < 30 days average
curl -X GET "https://nse-query-builder-backend.onrender.com/query-builder/current-iv-lt-30days"

# Get query schema/documentation
curl -X GET "https://nse-query-builder-backend.onrender.com/query-builder/dynamic/schema"
```

### 5. Complex Dynamic Query

```bash
curl -X POST "https://nse-query-builder-backend.onrender.com/query-builder/dynamic/execute" \
  -H "Content-Type: application/json" \
  -d '{
    "groups": [
      {
        "conditions": [
          {
            "field1": "current_call_iv",
            "operator": "GREATER_THAN", 
            "field2": "similar_results_avg_iv",
            "percentageThreshold": 20
          }
        ],
        "filters": [
          {
            "field": "instrument_type",
            "operator": "EQUALS",
            "value": "STOCK"
          }
        ],
        "logicalOperator": "AND"
      }
    ],
    "groupLogicalOperator": "AND",
    "sortBy": "percentageChange",
    "sortOrder": "DESC",
    "limit": 50
  }'
```

## 📊 **Expected Response Formats**

### Successful Query Response
```json
{
  "results": [
    {
      "symbol": "RELIANCE",
      "sector": "Oil & Gas", 
      "instrumentType": "STOCK",
      "currentCallIv": 35.2,
      "comparisonValue": 28.5,
      "difference": 6.7,
      "percentageChange": 23.5
    }
  ],
  "debugInfo": {
    "queryObject": {...},
    "sqlQuery": "SELECT ...",
    "executionTime": 84,
    "appliedFilters": [...],
    "queryComplexity": "Simple",
    "tablesUsed": ["market_summary"],
    "indexesUsed": ["idx_symbol"]
  }
}
```

### Empty Results Response
```json
{
  "results": [],
  "debugInfo": {
    "queryObject": {...},
    "sqlQuery": "SELECT ...",
    "executionTime": 45,
    "appliedFilters": [...],
    "queryComplexity": "Simple",
    "tablesUsed": ["market_summary"], 
    "indexesUsed": ["idx_symbol"]
  }
}
```

## 🧪 **Testing Strategy**

### 1. **Health Check** (Start Here)
- Test `available-queries` endpoint first
- Verify backend is responsive

### 2. **Simple Queries** (Main Frontend)
- Test with realistic values (like `25`) - should return data
- Test with extreme values (like `999999`) - should return empty array
- Test different operators: `gt`, `lt`, `eq`

### 3. **Pre-built Queries** 
- Test GET endpoints for immediate results
- Good for verifying database connectivity

### 4. **Error Handling**
- Test with invalid JSON
- Test with missing required fields
- Test with invalid field names

## 🔍 **Troubleshooting**

### Common Issues:
1. **503 Service Unavailable**: Render backend is cold-starting (wait 30 seconds)
2. **CORS Errors**: Backend CORS is configured, shouldn't happen
3. **Empty Results**: Database might be empty or query too restrictive
4. **Timeout**: First request might be slow due to cold start

### Status Codes:
- `200`: Success with results
- `201`: Success (POST requests)
- `400`: Bad request (invalid JSON/parameters)
- `500`: Server error (database issues)
- `503`: Service unavailable (cold start)

## 📝 **Notes**

- First request may take 20-30 seconds (Render cold start)
- All endpoints support CORS for frontend integration
- Database returns real NSE options data when available
- Empty arrays returned when no data matches query conditions
- Debug info always included for troubleshooting