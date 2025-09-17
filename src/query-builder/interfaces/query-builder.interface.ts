export enum ComparisonOperator {
  GREATER_THAN = 'gt',
  LESS_THAN = 'lt',
  GREATER_THAN_OR_EQUAL = 'gte',
  LESS_THAN_OR_EQUAL = 'lte',
  EQUALS = 'eq',
  NOT_EQUALS = 'ne',
  PERCENTAGE_CHANGE_GT = 'pct_gt',
  PERCENTAGE_CHANGE_LT = 'pct_lt',
}

export enum LogicalOperator {
  AND = 'and',
  OR = 'or',
}

export enum IVField {
  CURRENT_CALL_IV = 'current_call_iv',
  CURRENT_PUT_IV = 'current_put_iv',
  YESTERDAY_CLOSE_CALL_IV = 'yesterday_close_call_iv',
  TODAY_930_CALL_IV = 'today_930_call_iv',
  SIMILAR_RESULTS_AVG_IV = 'similar_results_avg_iv',
  CURRENT_PRICE = 'current_price',
}

// LiveOptionStrikes specific fields for future queries
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

export enum FilterField {
  SYMBOL = 'symbol',
  SECTOR = 'sector',
  INSTRUMENT_TYPE = 'instrument_type',
  RESULT_MONTH = 'result_month',
  IS_EXPIRY_WEEK = 'is_expiry_week',
}

export interface QueryCondition {
  field1: IVField;
  operator: ComparisonOperator;
  field2?: IVField;
  value?: number;
  percentageThreshold?: number;
}

export interface QueryFilter {
  field: FilterField;
  operator: ComparisonOperator;
  value: string | boolean | string[];
}

export interface QueryGroup {
  conditions: QueryCondition[];
  filters: QueryFilter[];
  logicalOperator: LogicalOperator;
}

export interface DynamicQuery {
  groups: QueryGroup[];
  groupLogicalOperator: LogicalOperator;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
}

export interface QueryResult {
  symbol: string;
  sector: string;
  instrumentType: string;
  currentCallIv: number;
  currentPutIv: number;
  comparisonField: string;
  comparisonValue: number;
  difference: number;
  percentageChange: number;
  resultMonth?: string;
  isExpiryWeek: boolean;
}

export interface QueryExecutionResponse {
  results: QueryResult[];
  totalCount: number;
  executionTime: number;
  query: DynamicQuery;
  generatedSQL: string;
}

export interface QueryTemplate {
  id: string;
  name: string;
  description: string;
  query: DynamicQuery;
  category: 'volatility' | 'comparison' | 'sector' | 'temporal' | 'custom';
  tags: string[];
}

// Predefined query templates
export const QUERY_TEMPLATES: QueryTemplate[] = [
  {
    id: 'high_iv_vs_3months',
    name: 'High IV vs 3 Months',
    description: 'Stocks with current IV significantly higher than 3-month average',
    category: 'volatility',
    tags: ['high-iv', '3-months', 'volatility-expansion'],
    query: {
      groups: [{
        conditions: [{
          field1: IVField.CURRENT_CALL_IV,
          operator: ComparisonOperator.PERCENTAGE_CHANGE_GT,
          field2: IVField.SIMILAR_RESULTS_AVG_IV,
          percentageThreshold: 20
        }],
        filters: [{
          field: FilterField.IS_EXPIRY_WEEK,
          operator: ComparisonOperator.EQUALS,
          value: false
        }, {
          field: FilterField.INSTRUMENT_TYPE,
          operator: ComparisonOperator.EQUALS,
          value: 'STOCK'
        }],
        logicalOperator: LogicalOperator.AND
      }],
      groupLogicalOperator: LogicalOperator.AND,
      sortBy: 'percentageChange',
      sortOrder: 'DESC',
      limit: 50
    }
  },
  {
    id: 'intraday_iv_spike',
    name: 'Intraday IV Spike',
    description: 'Stocks with significant IV increase since 9:30 AM',
    category: 'temporal',
    tags: ['intraday', 'spike', 'real-time'],
    query: {
      groups: [{
        conditions: [{
          field1: IVField.CURRENT_CALL_IV,
          operator: ComparisonOperator.PERCENTAGE_CHANGE_GT,
          field2: IVField.TODAY_930_CALL_IV,
          percentageThreshold: 15
        }],
        filters: [{
          field: FilterField.INSTRUMENT_TYPE,
          operator: ComparisonOperator.EQUALS,
          value: 'STOCK'
        }],
        logicalOperator: LogicalOperator.AND
      }],
      groupLogicalOperator: LogicalOperator.AND,
      sortBy: 'percentageChange',
      sortOrder: 'DESC',
      limit: 30
    }
  },
  {
    id: 'sector_iv_comparison',
    name: 'Banking Sector High IV',
    description: 'Banking sector stocks with elevated IV',
    category: 'sector',
    tags: ['banking', 'sector', 'high-iv'],
    query: {
      groups: [{
        conditions: [{
          field1: IVField.CURRENT_CALL_IV,
          operator: ComparisonOperator.GREATER_THAN,
          field2: IVField.SIMILAR_RESULTS_AVG_IV
        }],
        filters: [{
          field: FilterField.SECTOR,
          operator: ComparisonOperator.EQUALS,
          value: 'Banking'
        }, {
          field: FilterField.INSTRUMENT_TYPE,
          operator: ComparisonOperator.EQUALS,
          value: 'STOCK'
        }],
        logicalOperator: LogicalOperator.AND
      }],
      groupLogicalOperator: LogicalOperator.AND,
      sortBy: 'currentCallIv',
      sortOrder: 'DESC'
    }
  }
];