import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { QueryBuilderService, IVComparisonResult, SectorIVResult } from './query-builder.service';
import { DynamicQueryService } from './services/dynamic-query.service';
import {
  DynamicQuery,
  QueryExecutionResponse,
  QueryTemplate,
} from './interfaces/query-builder.interface';

@Controller('query-builder')
export class QueryBuilderController {
  constructor(
    private readonly queryBuilderService: QueryBuilderService,
    private readonly dynamicQueryService: DynamicQueryService,
  ) {}

  // Query 1: Current IV > 3 months avg (exclude expiry week and result month)
  @Get('current-iv-gt-3months')
  async getCurrentIvGreaterThan3MonthsAvg(
    @Query('excludeResultMonth') excludeResultMonth?: string,
  ): Promise<IVComparisonResult[]> {
    const exclude = excludeResultMonth !== 'false';
    return this.queryBuilderService.getCurrentIvGreaterThan3MonthsAvg(exclude);
  }

  // Query 2: Current IV > 1 week avg (exclude expiry week)
  @Get('current-iv-gt-1week')
  async getCurrentIvGreaterThan1WeekAvg(): Promise<IVComparisonResult[]> {
    return this.queryBuilderService.getCurrentIvGreaterThan1WeekAvg();
  }

  // Query 3: Current IV > 10% of yesterday's closing IV
  @Get('current-iv-gt-yesterday-10percent')
  async getCurrentIvGreaterThan10PercentYesterday(): Promise<IVComparisonResult[]> {
    return this.queryBuilderService.getCurrentIvGreaterThan10PercentYesterday();
  }

  // Query 4: Current IV > 10% of today's 9:30 AM IV
  @Get('current-iv-gt-today930-10percent')
  async getCurrentIvGreaterThan10PercentToday930(): Promise<IVComparisonResult[]> {
    return this.queryBuilderService.getCurrentIvGreaterThan10PercentToday930();
  }

  // Query 5: Selected sector wise IV
  @Get('sector-wise-iv')
  async getSectorWiseIV(
    @Query('sectors') sectors?: string,
  ): Promise<SectorIVResult[]> {
    const sectorArray = sectors ? sectors.split(',').map(s => s.trim()) : undefined;
    return this.queryBuilderService.getSectorWiseIV(sectorArray);
  }

  // Query 6: Similar result month avg IV > current IV
  @Get('similar-result-avg-gt-current')
  async getSimilarResultAvgIvGreaterThanCurrent(): Promise<IVComparisonResult[]> {
    return this.queryBuilderService.getSimilarResultAvgIvGreaterThanCurrent();
  }

  // Query 7: Similar result month avg IV < current IV
  @Get('similar-result-avg-lt-current')
  async getSimilarResultAvgIvLessThanCurrent(): Promise<IVComparisonResult[]> {
    return this.queryBuilderService.getSimilarResultAvgIvLessThanCurrent();
  }

  // Query 8: Result in this month and similar result avg IV < current IV
  @Get('this-month-results-high-iv')
  async getThisMonthResultsWithHighIV(): Promise<IVComparisonResult[]> {
    return this.queryBuilderService.getThisMonthResultsWithHighIV();
  }

  // Query 9: Index current IV > last one week's IV
  @Get('index-current-iv-gt-weekly')
  async getIndexCurrentIvGreaterThanWeekly(): Promise<IVComparisonResult[]> {
    return this.queryBuilderService.getIndexCurrentIvGreaterThanWeekly();
  }

  // Query 10: Index current IV < last one week's IV
  @Get('index-current-iv-lt-weekly')
  async getIndexCurrentIvLessThanWeekly(): Promise<IVComparisonResult[]> {
    return this.queryBuilderService.getIndexCurrentIvLessThanWeekly();
  }

  // NEW: Dynamic IV Comparison endpoints
  @Get('dynamic-iv-comparison/:days')
  async getDynamicIvComparison(
    @Param('days') days: string,
    @Query('operator') operator?: 'gt' | 'lt' | 'eq'
  ): Promise<IVComparisonResult[]> {
    const dayCount = parseInt(days, 10);
    if (isNaN(dayCount) || dayCount <= 0 || dayCount > 365) {
      throw new Error('Days must be a valid number between 1 and 365');
    }
    return this.queryBuilderService.getDynamicIvComparison(dayCount, operator || 'gt');
  }

  @Get('dynamic-iv/:days/greater-than')
  async getDynamicIvGreaterThan(@Param('days') days: string): Promise<IVComparisonResult[]> {
    return this.getDynamicIvComparison(days, 'gt');
  }

  @Get('dynamic-iv/:days/less-than')
  async getDynamicIvLessThan(@Param('days') days: string): Promise<IVComparisonResult[]> {
    return this.getDynamicIvComparison(days, 'lt');
  }

  // NEW: Add 'less than' versions of existing queries
  @Get('current-iv-lt-3months')
  async getCurrentIvLessThan3MonthsAvg(
    @Query('excludeResultMonth') excludeResultMonth?: string,
  ): Promise<IVComparisonResult[]> {
    return this.queryBuilderService.getDynamicIvComparison(90, 'lt');
  }

  @Get('current-iv-lt-1week')
  async getCurrentIvLessThan1WeekAvg(): Promise<IVComparisonResult[]> {
    return this.queryBuilderService.getDynamicIvComparison(7, 'lt');
  }

  @Get('current-iv-lt-21days')
  async getCurrentIvLessThan21DaysAvg(): Promise<IVComparisonResult[]> {
    return this.queryBuilderService.getDynamicIvComparison(21, 'lt');
  }

  @Get('current-iv-lt-30days')
  async getCurrentIvLessThan30DaysAvg(): Promise<IVComparisonResult[]> {
    return this.queryBuilderService.getDynamicIvComparison(30, 'lt');
  }

  // Utility endpoint: Get all available sectors
  @Get('available-sectors')
  async getAvailableSectors(): Promise<string[]> {
    return this.queryBuilderService.getAvailableSectors();
  }

  // Documentation endpoint: Get all available queries
  @Get('available-queries')
  getAvailableQueries() {
    return {
      message: 'NSE Query Builder - Advanced IV Analysis Queries',
      queries: [
        {
          id: 1,
          endpoint: '/query-builder/current-iv-gt-3months',
          description: 'Stocks with Current IV > 3 months avg (exclude expiry week & result month)',
          parameters: 'excludeResultMonth=true/false'
        },
        {
          id: 2,
          endpoint: '/query-builder/current-iv-gt-1week',
          description: 'Stocks with Current IV > 1 week avg (exclude expiry week)'
        },
        {
          id: 3,
          endpoint: '/query-builder/current-iv-gt-yesterday-10percent',
          description: 'Stocks with Current IV > 10% of yesterday\'s closing IV'
        },
        {
          id: 4,
          endpoint: '/query-builder/current-iv-gt-today930-10percent',
          description: 'Stocks with Current IV > 10% of today\'s 9:30 AM IV'
        },
        {
          id: 5,
          endpoint: '/query-builder/sector-wise-iv',
          description: 'Selected sector wise IV analysis',
          parameters: 'sectors=Banking,IT Services,Oil & Gas (comma-separated)'
        },
        {
          id: 6,
          endpoint: '/query-builder/similar-result-avg-gt-current',
          description: 'Stocks where similar result month avg IV > current IV'
        },
        {
          id: 7,
          endpoint: '/query-builder/similar-result-avg-lt-current',
          description: 'Stocks where similar result month avg IV < current IV'
        },
        {
          id: 8,
          endpoint: '/query-builder/this-month-results-high-iv',
          description: 'Stocks with result in this month and similar result avg IV < current IV'
        },
        {
          id: 9,
          endpoint: '/query-builder/index-current-iv-gt-weekly',
          description: 'Indices with current IV > last one week\'s IV'
        },
        {
          id: 10,
          endpoint: '/query-builder/index-current-iv-lt-weekly',
          description: 'Indices with current IV < last one week\'s IV'
        }
      ],
      utilities: [
        {
          endpoint: '/query-builder/available-sectors',
          description: 'Get all available sectors for filtering'
        },
        {
          endpoint: '/query-builder/available-queries',
          description: 'Get this documentation of all available queries'
        }
      ],
      lessThanQueries: [
        {
          id: 11,
          endpoint: '/query-builder/current-iv-lt-3months',
          description: 'Stocks with Current IV < 3 months avg (dynamic from nse_vol)'
        },
        {
          id: 12,
          endpoint: '/query-builder/current-iv-lt-1week',
          description: 'Stocks with Current IV < 1 week avg (dynamic from nse_vol)'
        },
        {
          id: 13,
          endpoint: '/query-builder/current-iv-lt-21days',
          description: 'Stocks with Current IV < 21 days avg (dynamic from nse_vol)'
        },
        {
          id: 14,
          endpoint: '/query-builder/current-iv-lt-30days',
          description: 'Stocks with Current IV < 30 days avg (dynamic from nse_vol)'
        }
      ],
      dynamicQuery: [
        {
          endpoint: '/query-builder/dynamic/execute',
          description: 'Execute dynamic query with custom conditions and filters',
          method: 'POST'
        },
        {
          endpoint: '/query-builder/dynamic/templates',
          description: 'Get all available query templates'
        },
        {
          endpoint: '/query-builder/dynamic/templates/:id',
          description: 'Get specific query template by ID'
        }
      ]
    };
  }

  // ===== DYNAMIC QUERY BUILDER ENDPOINTS =====
  
  @Post('test')
  async testPost(@Body() body: any): Promise<any> {
    return {
      message: 'POST endpoint working!',
      received: body,
      timestamp: new Date().toISOString()
    };
  }
  
  @Post('execute')
  async executeSimpleQuery(@Body() body: any): Promise<any> {
    console.log('🚀 Received query:', JSON.stringify(body, null, 2));
    
    try {
      // Handle DynamicQuery format from frontend (has groups property)
      if (body.groups && Array.isArray(body.groups) && body.groups[0]?.conditions) {
        console.log('🟡 Processing DynamicQuery format from frontend');
        
        // Extract the first condition from the DynamicQuery format
        const condition = body.groups[0].conditions[0];
        
        // Convert backend operator format to simple format
        const operatorMap: { [key: string]: string } = {
          'GREATER_THAN': 'gt',
          'LESS_THAN': 'lt',
          'EQUALS': 'eq',
          'GREATER_THAN_OR_EQUAL': 'gte',
          'LESS_THAN_OR_EQUAL': 'lte',
          'NOT_EQUALS': 'ne'
        };
        
        const simpleCondition = {
          field1: condition.field1,
          operator: operatorMap[condition.operator] || 'gt',
          field2: condition.field2,
          value: condition.value,
          percentageThreshold: condition.percentageThreshold
        };
        
        console.log('🔄 Converted to simple condition:', simpleCondition);
        
        // Process as if it was a simple array
        body = [simpleCondition];
      }
      
      // If it's a simple conditions array, execute directly via QueryBuilderService
      if (Array.isArray(body)) {
        const condition = body[0]; // Take first condition for now
        
        // Handle simple field-to-field comparisons
        if (condition.field1 && condition.field2 && condition.operator) {
          const startTime = Date.now();
          
          let sql = `
            SELECT 
              symbol,
              sector,
              current_call_iv as currentCallIv,
              current_put_iv as currentPutIv,
              ${condition.field2} as comparisonValue,
              (${condition.field1} - ${condition.field2}) as difference,
              CASE 
                WHEN ${condition.field2} > 0 THEN ((${condition.field1} - ${condition.field2}) / ${condition.field2} * 100)
                ELSE 0 
              END as percentageChange,
              instrument_type as instrumentType
            FROM market_summary 
            WHERE `;
          
          // Add condition based on operator
          switch (condition.operator) {
            case 'gt':
              sql += `${condition.field1} > ${condition.field2}`;
              break;
            case 'lt':
              sql += `${condition.field1} < ${condition.field2}`;
              break;
            case 'eq':
              sql += `${condition.field1} = ${condition.field2}`;
              break;
            default:
              sql += `${condition.field1} > ${condition.field2}`;
          }
          
          sql += ` AND instrument_type = 'STOCK' ORDER BY ABS(percentageChange) DESC LIMIT 50`;
          
          const results = await this.queryBuilderService.marketSummaryRepository.query(sql);
          const executionTime = Date.now() - startTime;
          
          // If no data found, return empty results
          if (results.length === 0) {
            console.log('ℹ️ No data found in database, returning empty results');
            
            return {
              results: [],
              debugInfo: {
                queryObject: { conditions: body },
                sqlQuery: sql,
                executionTime,
                appliedFilters: [{
                  field: condition.field1,
                  operator: condition.operator,
                  value: condition.field2
                }],
                queryComplexity: 'Simple',
                tablesUsed: ['market_summary'],
                indexesUsed: ['idx_symbol']
              }
            };
          }
          
          return {
            results: results.map((row: any) => ({
              symbol: row.symbol,
              sector: row.sector,
              instrumentType: row.instrumentType,
              currentCallIv: row.currentCallIv,
              comparisonField: condition.field2,
              comparisonValue: row.comparisonValue,
              difference: row.difference,
              percentageChange: row.percentageChange
            })),
            dataSource: 'REAL_DATABASE',
            message: `Found ${results.length} matching records from database.`,
            debugInfo: {
              queryObject: { conditions: body },
              sqlQuery: sql,
              executionTime,
              appliedFilters: [{
                field: condition.field1,
                operator: condition.operator,
                value: condition.field2
              }],
              queryComplexity: 'Simple',
              tablesUsed: ['market_summary'],
              indexesUsed: ['idx_symbol'],
              databaseStatus: 'CONNECTED_WITH_DATA'
            }
          };
        }
        
        // Handle value comparisons
        if (condition.field1 && condition.value !== undefined && condition.operator) {
          const startTime = Date.now();
          
          let sql = `
            SELECT 
              symbol,
              sector,
              current_call_iv as currentCallIv,
              current_put_iv as currentPutIv,
              ${condition.value} as comparisonValue,
              (${condition.field1} - ${condition.value}) as difference,
              instrument_type as instrumentType
            FROM market_summary 
            WHERE `;
          
          switch (condition.operator) {
            case 'gt':
              sql += `${condition.field1} > ${condition.value}`;
              break;
            case 'lt':
              sql += `${condition.field1} < ${condition.value}`;
              break;
            case 'eq':
              sql += `${condition.field1} = ${condition.value}`;
              break;
            default:
              sql += `${condition.field1} > ${condition.value}`;
          }
          
          sql += ` AND instrument_type = 'STOCK' ORDER BY ${condition.field1} DESC LIMIT 50`;
          
          const results = await this.queryBuilderService.marketSummaryRepository.query(sql);
          const executionTime = Date.now() - startTime;
          
          // If no data found, return empty results
          if (results.length === 0) {
            console.log('ℹ️ No data found for value-based query, returning empty results');
            
            return {
              results: [],
              debugInfo: {
                queryObject: { conditions: body },
                sqlQuery: sql,
                executionTime,
                appliedFilters: [{
                  field: condition.field1,
                  operator: condition.operator,
                  value: condition.value
                }],
                queryComplexity: 'Simple',
                tablesUsed: ['market_summary'],
                indexesUsed: ['idx_symbol']
              }
            };
          }
          
          return {
            results: results.map((row: any) => ({
              symbol: row.symbol,
              sector: row.sector,
              instrumentType: row.instrumentType,
              currentCallIv: row.currentCallIv,
              comparisonValue: row.comparisonValue,
              difference: row.difference,
              percentageChange: 0
            })),
            dataSource: 'REAL_DATABASE',
            message: `Found ${results.length} matching records from database.`,
            debugInfo: {
              queryObject: { conditions: body },
              sqlQuery: sql,
              executionTime,
              appliedFilters: [{
                field: condition.field1,
                operator: condition.operator,
                value: condition.value
              }],
              queryComplexity: 'Simple',
              tablesUsed: ['market_summary'],
              indexesUsed: ['idx_symbol'],
              databaseStatus: 'CONNECTED_WITH_DATA'
            }
          };
        }
      }
      
      // If no simple condition found, return error
      return {
        error: true,
        message: 'Unsupported query format',
        receivedBody: body
      };
      
    } catch (error) {
      console.error('❌ Simple query execution failed:', error.message);
      console.error('❌ Stack trace:', error.stack);
      
      // Return error response for database failures
      return {
        error: true,
        message: `Database query failed: ${error.message}`,
        results: [],
        receivedBody: body
      };
      
      return {
        error: true,
        dataSource: 'ERROR_NO_FALLBACK',
        message: error.message,
        stack: error.stack,
        receivedBody: body
      };
    }
  }
  
  private mapSimpleOperator(operator: string): string {
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
    return operatorMap[operator] || 'GREATER_THAN';
  }

  
  @Post('dynamic/execute')
  async executeDynamicQuery(@Body() query: any): Promise<QueryExecutionResponse> {
    const validation = this.dynamicQueryService.validateQuery(query);
    if (!validation.valid) {
      throw new Error(`Invalid query: ${validation.errors.join(', ')}`);
    }
    
    return this.dynamicQueryService.executeQuery(query);
  }

  @Post('dynamic/validate')
  async validateDynamicQuery(@Body() query: any): Promise<{ valid: boolean; errors: string[] }> {
    return this.dynamicQueryService.validateQuery(query);
  }

  @Get('dynamic/templates')
  async getQueryTemplates(): Promise<QueryTemplate[]> {
    return this.dynamicQueryService.getQueryTemplates();
  }

  @Get('dynamic/templates/:id')
  async getQueryTemplate(@Param('id') id: string): Promise<QueryTemplate> {
    const template = await this.dynamicQueryService.getQueryTemplate(id);
    if (!template) {
      throw new Error(`Template with ID ${id} not found`);
    }
    return template;
  }

  @Post('dynamic/templates')
  async saveQueryTemplate(@Body() template: any): Promise<QueryTemplate> {
    return this.dynamicQueryService.saveQueryTemplate(template);
  }

  @Get('dynamic/schema')
  getQueryBuilderSchema() {
    return {
      message: 'Dynamic Query Builder Schema',
      fields: {
        ivFields: [
          'current_call_iv',
          'current_put_iv', 
          'yesterday_close_call_iv',
          'today_930_call_iv',
          'similar_results_avg_iv',
          'current_price'
        ],
        filterFields: [
          'symbol',
          'sector',
          'instrument_type',
          'result_month',
          'is_expiry_week'
        ],
        optionStrikeFields: [
          'strike',
          'call_ltp',
          'call_volume',
          'call_iv',
          'call_delta',
          'call_theta',
          'call_gamma',
          'call_vega',
          'put_ltp',
          'put_volume',
          'put_iv',
          'put_delta',
          'put_theta',
          'put_gamma',
          'put_vega',
          'is_atm',
          'expiry'
        ],
        operators: [
          'gt', 'lt', 'gte', 'lte', 'eq', 'ne', 'pct_gt', 'pct_lt'
        ],
        logicalOperators: ['and', 'or']
      },
      exampleQuery: {
        groups: [{
          conditions: [{
            field1: 'current_call_iv',
            operator: 'pct_gt',
            field2: 'similar_results_avg_iv',
            percentageThreshold: 20
          }],
          filters: [{
            field: 'instrument_type',
            operator: 'eq',
            value: 'STOCK'
          }],
          logicalOperator: 'and'
        }],
        groupLogicalOperator: 'and',
        sortBy: 'percentageChange',
        sortOrder: 'DESC',
        limit: 50
      },
      futureQueries: [
        {
          category: 'LiveOptionStrikes Integration',
          description: 'Future queries that will join market_summary with live_option_strikes table',
          queries: [
            {
              endpoint: '/query-builder/future/high-volume-iv-spikes',
              description: 'Stocks with high option volume and IV spikes (joins market_summary + live_option_strikes)',
              status: 'Available for implementation'
            },
            {
              endpoint: '/query-builder/future/atm-options-analysis',
              description: 'ATM options analysis with current IV comparison',
              status: 'Available for implementation'
            },
            {
              endpoint: '/query-builder/future/high-delta-gamma-options',
              description: 'Options with high delta and gamma values',
              status: 'Available for implementation'
            }
          ]
        }
      ]
    };
  }

  // =============================================================
  // FUTURE ENDPOINTS - LiveOptionStrikes Integration
  // =============================================================
  
  @Get('future/high-volume-iv-spikes')
  async getHighVolumeIvSpikes(): Promise<any[]> {
    return this.queryBuilderService.getHighVolumeIvSpikes();
  }

  @Get('future/atm-options-analysis')
  async getAtmOptionsAnalysis(): Promise<any[]> {
    return this.queryBuilderService.getAtmOptionsAnalysis();
  }

  @Get('future/high-delta-gamma-options')
  async getHighDeltaGammaOptions(): Promise<any[]> {
    return this.queryBuilderService.getHighDeltaGammaOptions();
  }
}
