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

export enum FilterField {
  SYMBOL = 'symbol',
  SECTOR = 'sector',
  INSTRUMENT_TYPE = 'instrument_type',
  RESULT_MONTH = 'result_month',
  IS_EXPIRY_WEEK = 'is_expiry_week',
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

export enum FilterType {
  SECTOR = 'sector',
  EXPIRY_RANGE = 'expiry_range',
  STRIKE_RANGE = 'strike_range',
  VOLUME_RANGE = 'volume_range',
  OI_RANGE = 'oi_range',
}

export interface QueryCondition {
  field1: IVField;
  operator: ComparisonOperator;
  field2?: IVField;
  value?: number;
  percentageThreshold?: number;
}

export interface QueryFilter {
  // Old format (for compatibility)
  field?: FilterField;
  operator?: ComparisonOperator;
  value?: string | boolean | string[];
  // New format (for dynamic filters)
  type?: FilterType;
  values?: string[];
  min?: number;
  max?: number;
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
  currentPutIv?: number;
  comparisonField?: string;
  comparisonValue: number;
  difference: number;
  percentageChange: number;
  resultMonth?: string;
  isExpiryWeek?: boolean;
  // Simple Query Builder specific fields
  field1Value?: number;
  field1Label?: string;
  field2Value?: number;
  field2Label?: string;
}

// Backend response format for Simple Query Builder
export interface SimpleQueryResponse {
  results: QueryResult[];
  debugInfo?: {
    queryObject: any;
    sqlQuery: string;
    executionTime: number;
    appliedFilters: Array<{
      field: string;
      operator: string;
      value: string | number;
    }>;
    queryComplexity: 'Simple' | 'Moderate' | 'Complex';
    tablesUsed: string[];
    indexesUsed: string[];
  };
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

// Field display names for UI
export const IV_FIELD_LABELS = {
  [IVField.CURRENT_CALL_IV]: 'Current Call IV',
  [IVField.CURRENT_PUT_IV]: 'Current Put IV',
  [IVField.YESTERDAY_CLOSE_CALL_IV]: 'Yesterday Close Call IV',
  [IVField.TODAY_930_CALL_IV]: 'Today 9:30 AM Call IV',
  [IVField.SIMILAR_RESULTS_AVG_IV]: 'Similar Results Avg IV',
  [IVField.CURRENT_PRICE]: 'Current Price',
};

export const OPERATOR_LABELS = {
  [ComparisonOperator.GREATER_THAN]: 'Greater Than',
  [ComparisonOperator.LESS_THAN]: 'Less Than',
  [ComparisonOperator.GREATER_THAN_OR_EQUAL]: 'Greater Than or Equal',
  [ComparisonOperator.LESS_THAN_OR_EQUAL]: 'Less Than or Equal',
  [ComparisonOperator.EQUALS]: 'Equals',
  [ComparisonOperator.NOT_EQUALS]: 'Not Equals',
  [ComparisonOperator.PERCENTAGE_CHANGE_GT]: '% Change Greater Than',
  [ComparisonOperator.PERCENTAGE_CHANGE_LT]: '% Change Less Than',
};

export const FILTER_FIELD_LABELS = {
  [FilterField.SYMBOL]: 'Symbol',
  [FilterField.SECTOR]: 'Sector',
  [FilterField.INSTRUMENT_TYPE]: 'Instrument Type',
  [FilterField.RESULT_MONTH]: 'Result Month',
  [FilterField.IS_EXPIRY_WEEK]: 'Is Expiry Week',
};

export const OPTION_STRIKE_FIELD_LABELS = {
  [OptionStrikeField.STRIKE]: 'Strike Price',
  [OptionStrikeField.CALL_LTP]: 'Call Last Traded Price',
  [OptionStrikeField.CALL_VOLUME]: 'Call Volume',
  [OptionStrikeField.CALL_IV]: 'Call Implied Volatility',
  [OptionStrikeField.CALL_DELTA]: 'Call Delta',
  [OptionStrikeField.CALL_THETA]: 'Call Theta',
  [OptionStrikeField.CALL_GAMMA]: 'Call Gamma',
  [OptionStrikeField.CALL_VEGA]: 'Call Vega',
  [OptionStrikeField.PUT_LTP]: 'Put Last Traded Price',
  [OptionStrikeField.PUT_VOLUME]: 'Put Volume',
  [OptionStrikeField.PUT_IV]: 'Put Implied Volatility',
  [OptionStrikeField.PUT_DELTA]: 'Put Delta',
  [OptionStrikeField.PUT_THETA]: 'Put Theta',
  [OptionStrikeField.PUT_GAMMA]: 'Put Gamma',
  [OptionStrikeField.PUT_VEGA]: 'Put Vega',
  [OptionStrikeField.IS_ATM]: 'Is At-The-Money',
  [OptionStrikeField.EXPIRY]: 'Expiry Date',
};
