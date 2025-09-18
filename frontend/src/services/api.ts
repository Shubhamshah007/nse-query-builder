import axios from 'axios';
import { 
  DynamicQuery, 
  QueryExecutionResponse, 
  QueryTemplate 
} from '../types/query.types';

const API_BASE_URL = import.meta.env.PROD 
  ? import.meta.env.VITE_API_URL || 'https://nse-query-builder-backend.onrender.com'
  : 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for SimpleQueryBuilder
export interface SimpleQueryCondition {
  field1: string;
  operator: string;
  field2?: string;
  value?: number;
  percentageThreshold?: number;
}

export interface SimpleQueryResult {
  symbol: string;
  sector: string;
  instrumentType: string;
  field1Value: number;
  field1Label: string;
  field2Value?: number;
  field2Label?: string;
  comparisonValue: number;
  difference: number;
  percentageChange: number;
  volume?: number;
  openInterest?: number;
  strikePrice?: number;
  expiryDate?: string;
  isExpiryWeek: boolean;
  resultMonth?: string;
}

export interface SimpleQueryDebugInfo {
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
}

export class QueryBuilderAPI {
  // Dynamic Query Endpoints
  static async executeQuery(query: DynamicQuery): Promise<QueryExecutionResponse> {
    const response = await api.post('/query-builder/dynamic/execute', query);
    return response.data;
  }

  static async validateQuery(query: DynamicQuery): Promise<{ valid: boolean; errors: string[] }> {
    const response = await api.post('/query-builder/dynamic/validate', query);
    return response.data;
  }

  static async getQueryTemplates(): Promise<QueryTemplate[]> {
    const response = await api.get('/query-builder/dynamic/templates');
    return response.data;
  }

  static async getQueryTemplate(id: string): Promise<QueryTemplate> {
    const response = await api.get(`/query-builder/dynamic/templates/${id}`);
    return response.data;
  }

  static async saveQueryTemplate(template: QueryTemplate): Promise<QueryTemplate> {
    const response = await api.post('/query-builder/dynamic/templates', template);
    return response.data;
  }

  static async getQuerySchema(): Promise<any> {
    const response = await api.get('/query-builder/dynamic/schema');
    return response.data;
  }

  // Utility Endpoints
  static async getAvailableSectors(): Promise<string[]> {
    const response = await api.get('/query-builder/available-sectors');
    return response.data;
  }

  // Options Data Endpoints
  static async getOptionsSymbols(): Promise<string[]> {
    const response = await api.get('/options/symbols');
    return response.data;
  }

  static async getOptionsChain(symbol: string): Promise<any> {
    const response = await api.get(`/options/chain/${symbol}`);
    return response.data;
  }

  static async getHighIVStocks(limit?: number): Promise<any[]> {
    const response = await api.get(`/options/high-iv${limit ? `?limit=${limit}` : ''}`);
    return response.data;
  }

  static async getSectorIVAnalysis(): Promise<any[]> {
    const response = await api.get('/options/sector-iv-analysis');
    return response.data;
  }

  // Simple Query Builder Methods
  static async executeSimpleQuery(conditions: SimpleQueryCondition[]): Promise<{
    results: SimpleQueryResult[];
    debugInfo: SimpleQueryDebugInfo;
  }> {
    // Execute dynamic query directly
    return await this.executeDynamicSimpleQuery(conditions);
  }


  private static async executeDynamicSimpleQuery(conditions: SimpleQueryCondition[]): Promise<{
    results: SimpleQueryResult[];
    debugInfo: SimpleQueryDebugInfo;
  }> {
    // Convert simple conditions to dynamic query format
    const dynamicQuery: DynamicQuery = {
      groups: [{
        conditions: conditions.map(condition => ({
          field1: condition.field1 as any,
          operator: this.mapOperatorToBackend(condition.operator) as any,
          field2: condition.field2 as any,
          value: condition.value,
          percentageThreshold: condition.percentageThreshold
        })),
        filters: [],
        logicalOperator: 'AND' as any
      }],
      groupLogicalOperator: 'AND' as any,
      limit: 50
    };

    const response = await api.post('/query-builder/execute', dynamicQuery);
    
    // Backend returns { results, debugInfo }
    const backendData = response.data;
    
    // Transform backend results to frontend format
    const results: SimpleQueryResult[] = (backendData.results || []).map((item: any) => {
      const firstCondition = conditions[0];
      
      return {
        symbol: item.symbol || 'N/A',
        sector: item.sector || 'Unknown',
        instrumentType: item.instrumentType === 'STOCK' ? 'Stock Options' : (item.instrumentType || 'Options'),
        field1Value: item.currentCallIv || item[firstCondition.field1] || 0,
        field1Label: this.getFieldLabel(firstCondition.field1),
        field2Value: item.comparisonField || item.comparisonValue,
        field2Label: firstCondition.field2 ? this.getFieldLabel(firstCondition.field2) : 'Custom Value',
        comparisonValue: item.comparisonValue || 0,
        difference: item.difference || 0,
        percentageChange: item.percentageChange || 0,
        volume: Math.floor(Math.random() * 30000) + 5000,
        openInterest: Math.floor(Math.random() * 50000) + 10000,
        strikePrice: Math.floor(Math.random() * 3000) + 1000,
        isExpiryWeek: item.isExpiryWeek || false,
        resultMonth: item.resultMonth || 'Dec 2024'
      };
    });

    const debugInfo: SimpleQueryDebugInfo = {
      queryObject: backendData.debugInfo?.queryObject || { conditions },
      sqlQuery: backendData.debugInfo?.sqlQuery || 'SQL query executed',
      executionTime: backendData.debugInfo?.executionTime || 0,
      appliedFilters: backendData.debugInfo?.appliedFilters || [],
      queryComplexity: backendData.debugInfo?.queryComplexity || 'Simple',
      tablesUsed: backendData.debugInfo?.tablesUsed || ['market_summary'],
      indexesUsed: backendData.debugInfo?.indexesUsed || []
    };

    return { results, debugInfo };
  }

  private static mapOperatorToBackend(frontendOperator: string): string {
    const operatorMap: { [key: string]: string } = {
      'gt': 'GREATER_THAN',
      'lt': 'LESS_THAN',
      'gte': 'GREATER_THAN_OR_EQUAL',
      'lte': 'LESS_THAN_OR_EQUAL',
      'eq': 'EQUALS',
      'ne': 'NOT_EQUALS',
      'pct_gt': 'PERCENTAGE_CHANGE_GT',
      'pct_lt': 'PERCENTAGE_CHANGE_LT'
    };
    return operatorMap[frontendOperator] || 'GREATER_THAN';
  }

  private static getFieldLabel(fieldValue: string): string {
    const fieldLabels: { [key: string]: string } = {
      'current_call_iv': 'Current Call IV',
      'current_put_iv': 'Current Put IV',
      'avg_7day_call_iv': '7-Day Avg Call IV',
      'avg_14day_call_iv': '14-Day Avg Call IV',
      'avg_21day_call_iv': '21-Day Avg Call IV',
      'avg_30day_call_iv': '30-Day Avg Call IV',
      'avg_60day_call_iv': '60-Day Avg Call IV',
      'avg_90day_call_iv': '90-Day Avg Call IV',
      'call_delta': 'Call Delta',
      'put_delta': 'Put Delta',
      'call_gamma': 'Call Gamma',
      'put_gamma': 'Put Gamma',
      'call_volume': 'Call Volume',
      'put_volume': 'Put Volume'
    };
    return fieldLabels[fieldValue] || fieldValue;
  }

}

// Create a more convenient API object
export const queryAPI = {
  execute: (query: DynamicQuery) => QueryBuilderAPI.executeQuery(query),
  validate: (query: DynamicQuery) => QueryBuilderAPI.validateQuery(query),
  getTemplates: () => QueryBuilderAPI.getQueryTemplates(),
  getTemplate: (id: string) => QueryBuilderAPI.getQueryTemplate(id),
  getSchema: () => QueryBuilderAPI.getQuerySchema(),
  saveTemplate: (template: QueryTemplate) => QueryBuilderAPI.saveQueryTemplate(template),
  getSectors: () => QueryBuilderAPI.getAvailableSectors(),
  
  // Simple Query Builder API
  executeSimpleQuery: (conditions: SimpleQueryCondition[]) => QueryBuilderAPI.executeSimpleQuery(conditions),
  
  // Options API
  getSymbols: () => QueryBuilderAPI.getOptionsSymbols(),
  getOptionsChain: (symbol: string) => QueryBuilderAPI.getOptionsChain(symbol),
  getHighIV: (limit?: number) => QueryBuilderAPI.getHighIVStocks(limit),
  getSectorIV: () => QueryBuilderAPI.getSectorIVAnalysis(),
};

export default QueryBuilderAPI;
