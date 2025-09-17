import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketSummary } from '../../entities';
import {
  DynamicQuery,
  QueryCondition,
  QueryFilter,
  QueryGroup,
  QueryResult,
  QueryExecutionResponse,
  QueryTemplate,
  QUERY_TEMPLATES,
  ComparisonOperator,
  LogicalOperator,
  IVField,
  FilterField,
} from '../interfaces/query-builder.interface';

@Injectable()
export class DynamicQueryService {
  constructor(
    @InjectRepository(MarketSummary)
    private marketSummaryRepository: Repository<MarketSummary>,
  ) {}

  async executeQuery(query: DynamicQuery): Promise<QueryExecutionResponse> {
    const startTime = Date.now();
    
    try {
      const { sql, params } = this.buildSQL(query);
      const results = await this.marketSummaryRepository.query(sql, params);
      const totalCount = results.length;
      
      const executionTime = Date.now() - startTime;
      
      return {
        results: results.map(r => this.mapResultRow(r)),
        totalCount,
        executionTime,
        query,
        generatedSQL: sql,
      };
    } catch (error) {
      throw new Error(`Query execution failed: ${error.message}`);
    }
  }

  private buildSQL(query: DynamicQuery): { sql: string; params: any[] } {
    const params: any[] = [];
    let paramIndex = 0;

    // Base SELECT clause
    let sql = `
      SELECT 
        symbol,
        sector,
        instrument_type as instrumentType,
        current_call_iv as currentCallIv,
        current_put_iv as currentPutIv,
        result_month as resultMonth,
        is_expiry_week as isExpiryWeek
    `;

    // Add dynamic comparison fields based on conditions
    const comparisonFields = this.extractComparisonFields(query);
    for (const field of comparisonFields) {
      sql += `,\n        ${field}`;
    }

    sql += `\n      FROM market_summary\n      WHERE `;

    // Build WHERE clause
    const whereClauses: string[] = [];
    
    for (let i = 0; i < query.groups.length; i++) {
      const group = query.groups[i];
      const groupClause = this.buildGroupClause(group, params, paramIndex);
      whereClauses.push(`(${groupClause.sql})`);
      paramIndex = groupClause.paramIndex;
    }

    sql += whereClauses.join(` ${query.groupLogicalOperator.toUpperCase()} `);

    // Add ORDER BY
    if (query.sortBy) {
      sql += `\n      ORDER BY ${query.sortBy} ${query.sortOrder || 'DESC'}`;
    }

    // Add LIMIT and OFFSET
    if (query.limit) {
      sql += `\n      LIMIT ?`;
      params.push(query.limit);
    }
    
    if (query.offset) {
      sql += `\n      OFFSET ?`;
      params.push(query.offset);
    }

    return { sql, params };
  }

  private buildGroupClause(
    group: QueryGroup,
    params: any[],
    startParamIndex: number
  ): { sql: string; paramIndex: number } {
    const clauses: string[] = [];
    let paramIndex = startParamIndex;

    // Build condition clauses
    for (const condition of group.conditions) {
      const conditionClause = this.buildConditionClause(condition, params, paramIndex);
      clauses.push(conditionClause.sql);
      paramIndex = conditionClause.paramIndex;
    }

    // Build filter clauses
    for (const filter of group.filters) {
      const filterClause = this.buildFilterClause(filter, params, paramIndex);
      clauses.push(filterClause.sql);
      paramIndex = filterClause.paramIndex;
    }

    const sql = clauses.join(` ${group.logicalOperator.toUpperCase()} `);
    return { sql, paramIndex };
  }

  private buildConditionClause(
    condition: QueryCondition,
    params: any[],
    startParamIndex: number
  ): { sql: string; paramIndex: number } {
    let paramIndex = startParamIndex;
    const field1 = condition.field1;
    
    switch (condition.operator) {
      case ComparisonOperator.GREATER_THAN:
        if (condition.field2) {
          return { sql: `${field1} > ${condition.field2}`, paramIndex };
        } else {
          params.push(condition.value);
          return { sql: `${field1} > ?`, paramIndex: paramIndex + 1 };
        }
      
      case ComparisonOperator.LESS_THAN:
        if (condition.field2) {
          return { sql: `${field1} < ${condition.field2}`, paramIndex };
        } else {
          params.push(condition.value);
          return { sql: `${field1} < ?`, paramIndex: paramIndex + 1 };
        }
      
      case ComparisonOperator.EQUALS:
        if (condition.field2) {
          return { sql: `${field1} = ${condition.field2}`, paramIndex };
        } else {
          params.push(condition.value);
          return { sql: `${field1} = ?`, paramIndex: paramIndex + 1 };
        }
      
      case ComparisonOperator.PERCENTAGE_CHANGE_GT:
        if (condition.field2 && condition.percentageThreshold) {
          const threshold = condition.percentageThreshold / 100;
          params.push(threshold);
          return { 
            sql: `${field1} > ${condition.field2} * (1 + ?)`, 
            paramIndex: paramIndex + 1 
          };
        }
        break;
      
      case ComparisonOperator.PERCENTAGE_CHANGE_LT:
        if (condition.field2 && condition.percentageThreshold) {
          const threshold = condition.percentageThreshold / 100;
          params.push(threshold);
          return { 
            sql: `${field1} < ${condition.field2} * (1 - ?)`, 
            paramIndex: paramIndex + 1 
          };
        }
        break;
      
      default:
        throw new Error(`Unsupported condition operator: ${condition.operator}`);
    }

    throw new Error(`Invalid condition configuration`);
  }

  private buildFilterClause(
    filter: QueryFilter,
    params: any[],
    startParamIndex: number
  ): { sql: string; paramIndex: number } {
    let paramIndex = startParamIndex;
    
    switch (filter.operator) {
      case ComparisonOperator.EQUALS:
        params.push(filter.value);
        return { sql: `${filter.field} = ?`, paramIndex: paramIndex + 1 };
      
      case ComparisonOperator.NOT_EQUALS:
        params.push(filter.value);
        return { sql: `${filter.field} != ?`, paramIndex: paramIndex + 1 };
      
      default:
        throw new Error(`Unsupported filter operator: ${filter.operator}`);
    }
  }

  private extractComparisonFields(query: DynamicQuery): string[] {
    const fields = new Set<string>();
    
    for (const group of query.groups) {
      for (const condition of group.conditions) {
        if (condition.field2) {
          fields.add(`${condition.field2} as comparisonValue`);
          fields.add(`(${condition.field1} - ${condition.field2}) as difference`);
          
          // Add percentage change calculation
          const percentageCalc = `CASE 
            WHEN ${condition.field2} > 0 THEN ((${condition.field1} - ${condition.field2}) / ${condition.field2} * 100)
            ELSE 0 
          END as percentageChange`;
          fields.add(percentageCalc);
        }
      }
    }
    
    return Array.from(fields);
  }

  private mapResultRow(row: any): QueryResult {
    return {
      symbol: row.symbol,
      sector: row.sector,
      instrumentType: row.instrumentType,
      currentCallIv: row.currentCallIv,
      currentPutIv: row.currentPutIv,
      comparisonField: row.comparisonField || 'N/A',
      comparisonValue: row.comparisonValue || 0,
      difference: row.difference || 0,
      percentageChange: row.percentageChange || 0,
      resultMonth: row.resultMonth,
      isExpiryWeek: row.isExpiryWeek,
    };
  }

  async getQueryTemplates(): Promise<QueryTemplate[]> {
    return QUERY_TEMPLATES;
  }

  async getQueryTemplate(id: string): Promise<QueryTemplate | null> {
    return QUERY_TEMPLATES.find(t => t.id === id) || null;
  }

  async saveQueryTemplate(template: QueryTemplate): Promise<QueryTemplate> {
    // In a real implementation, you'd save to database
    // For now, just return the template
    return template;
  }

  validateQuery(query: DynamicQuery): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!query.groups || query.groups.length === 0) {
      errors.push('Query must have at least one group');
    }

    for (const group of query.groups) {
      if (group.conditions.length === 0 && group.filters.length === 0) {
        errors.push('Each group must have at least one condition or filter');
      }

      for (const condition of group.conditions) {
        if (!condition.field1) {
          errors.push('Condition must have field1');
        }
        
        if (condition.operator === ComparisonOperator.PERCENTAGE_CHANGE_GT ||
            condition.operator === ComparisonOperator.PERCENTAGE_CHANGE_LT) {
          if (!condition.field2 || !condition.percentageThreshold) {
            errors.push('Percentage change operations require field2 and percentageThreshold');
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}