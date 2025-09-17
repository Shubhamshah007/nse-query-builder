import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketSummary, InstrumentType } from '../entities';

export interface IVComparisonResult {
  symbol: string;
  sector: string;
  currentCallIv: number;
  comparisonValue: number;
  difference: number;
  percentageChange: number;
  instrumentType: string;
}

export interface SectorIVResult {
  sector: string;
  avgCurrentIv: number;
  avgHistoricalIv: number;
  stockCount: number;
  topStocks: string[];
}

@Injectable()
export class QueryBuilderService {
  private readonly logger = new Logger(QueryBuilderService.name);
  
  constructor(
    @InjectRepository(MarketSummary)
    public marketSummaryRepository: Repository<MarketSummary>,
  ) {}

  // Query 1: Current IV > 3 months avg (exclude expiry week and result month) - DYNAMIC VERSION
  async getCurrentIvGreaterThan3MonthsAvg(excludeResultMonth: boolean = true): Promise<IVComparisonResult[]> {
    this.logger.log('Executing getCurrentIvGreaterThan3MonthsAvg query (dynamic)');
    
    try {
      const query = `
        SELECT 
          ms.symbol,
          ms.sector,
          ms.current_call_iv as currentCallIv,
          COALESCE(nv_avg.avg_90day_vol, 0) as comparisonValue,
          (ms.current_call_iv - COALESCE(nv_avg.avg_90day_vol, 0)) as difference,
          CASE 
            WHEN COALESCE(nv_avg.avg_90day_vol, 0) > 0 
            THEN ((ms.current_call_iv - nv_avg.avg_90day_vol) / nv_avg.avg_90day_vol * 100)
            ELSE 0 
          END as percentageChange,
          ms.instrument_type as instrumentType
        FROM market_summary ms
        LEFT JOIN (
          SELECT 
            'DEFAULT' as symbol_match,
            AVG(ATM_vol) as avg_90day_vol
          FROM nse_vol 
          WHERE date >= (
            SELECT DATE_SUB(MAX(date), INTERVAL 90 DAY) 
            FROM nse_vol WHERE ATM_vol > 0
          )
          AND ATM_vol > 0
        ) nv_avg ON 1=1
        WHERE ms.current_call_iv > COALESCE(nv_avg.avg_90day_vol, 0)
          AND ms.is_expiry_week = FALSE
          AND ms.instrument_type = 'STOCK'
          ${excludeResultMonth ? "AND (ms.result_month IS NULL OR ms.result_month != DATE_FORMAT(NOW(), '%Y-%m'))" : ''}
        ORDER BY percentageChange DESC
      `;

      const results = await this.marketSummaryRepository.query(query);
      this.logger.log(`Query completed successfully, returned ${results.length} results`);
      return results;
    } catch (error) {
      this.logger.error('Failed to execute getCurrentIvGreaterThan3MonthsAvg query', error.stack);
      throw new Error(`Database query failed: ${error.message}`);
    }
  }

  // Query 2: Current IV > 1 week avg (exclude expiry week) - DYNAMIC VERSION
  async getCurrentIvGreaterThan1WeekAvg(): Promise<IVComparisonResult[]> {
    this.logger.log('Executing getCurrentIvGreaterThan1WeekAvg query (dynamic)');
    
    try {
      const query = `
        SELECT 
          ms.symbol,
          ms.sector,
          ms.current_call_iv as currentCallIv,
          COALESCE(nv_avg.avg_7day_vol, 0) as comparisonValue,
          (ms.current_call_iv - COALESCE(nv_avg.avg_7day_vol, 0)) as difference,
          CASE 
            WHEN COALESCE(nv_avg.avg_7day_vol, 0) > 0 
            THEN ((ms.current_call_iv - nv_avg.avg_7day_vol) / nv_avg.avg_7day_vol * 100)
            ELSE 0 
          END as percentageChange,
          ms.instrument_type as instrumentType
        FROM market_summary ms
        LEFT JOIN (
          SELECT 
            'DEFAULT' as symbol_match,
            AVG(ATM_vol) as avg_7day_vol
          FROM nse_vol 
          WHERE date >= (
            SELECT DATE_SUB(MAX(date), INTERVAL 7 DAY) 
            FROM nse_vol WHERE ATM_vol > 0
          )
          AND ATM_vol > 0
        ) nv_avg ON 1=1
        WHERE ms.current_call_iv > COALESCE(nv_avg.avg_7day_vol, 0)
          AND ms.is_expiry_week = FALSE
          AND ms.instrument_type = 'STOCK'
        ORDER BY percentageChange DESC
      `;

      const results = await this.marketSummaryRepository.query(query);
      this.logger.log(`Query completed successfully, returned ${results.length} results`);
      return results;
    } catch (error) {
      this.logger.error('Failed to execute getCurrentIvGreaterThan1WeekAvg query', error.stack);
      throw new Error(`Database query failed: ${error.message}`);
    }
  }

  // Query 3: Current IV > 10% of yesterday's closing IV
  async getCurrentIvGreaterThan10PercentYesterday(): Promise<IVComparisonResult[]> {
    const query = `
      SELECT 
        symbol,
        sector,
        current_call_iv as currentCallIv,
        yesterday_close_call_iv as comparisonValue,
        (current_call_iv - yesterday_close_call_iv) as difference,
        CASE 
          WHEN yesterday_close_call_iv > 0 THEN ((current_call_iv - yesterday_close_call_iv) / yesterday_close_call_iv * 100)
          ELSE 0 
        END as percentageChange,
        instrument_type as instrumentType
      FROM market_summary 
      WHERE current_call_iv > (yesterday_close_call_iv * 1.1)
        AND instrument_type = 'STOCK'
      ORDER BY percentageChange DESC
    `;

    return await this.marketSummaryRepository.query(query);
  }

  // Query 4: Current IV > 10% of today's 9:30 AM IV
  async getCurrentIvGreaterThan10PercentToday930(): Promise<IVComparisonResult[]> {
    const query = `
      SELECT 
        symbol,
        sector,
        current_call_iv as currentCallIv,
        today_930_call_iv as comparisonValue,
        (current_call_iv - today_930_call_iv) as difference,
        CASE 
          WHEN today_930_call_iv > 0 THEN ((current_call_iv - today_930_call_iv) / today_930_call_iv * 100)
          ELSE 0 
        END as percentageChange,
        instrument_type as instrumentType
      FROM market_summary 
      WHERE current_call_iv > (today_930_call_iv * 1.1)
        AND instrument_type = 'STOCK'
      ORDER BY percentageChange DESC
    `;

    return await this.marketSummaryRepository.query(query);
  }

  // Query 5: Selected sector wise IV
  async getSectorWiseIV(sectors?: string[]): Promise<SectorIVResult[]> {
    let sectorFilter = '';
    if (sectors && sectors.length > 0) {
      const sectorList = sectors.map(s => `'${s}'`).join(', ');
      sectorFilter = `AND sector IN (${sectorList})`;
    }

    const query = `
      SELECT 
        sector,
        AVG(current_call_iv) as avgCurrentIv,
        AVG(avg_21day_call_iv) as avgHistoricalIv,
        COUNT(*) as stockCount,
        GROUP_CONCAT(symbol ORDER BY current_call_iv DESC SEPARATOR ',') as topStocks
      FROM market_summary 
      WHERE sector IS NOT NULL 
        AND sector != 'Unknown'
        AND instrument_type = 'STOCK'
        ${sectorFilter}
      GROUP BY sector
      ORDER BY avgCurrentIv DESC
    `;

    const results = await this.marketSummaryRepository.query(query);
    return results.map(r => ({
      ...r,
      topStocks: r.topStocks ? r.topStocks.split(',') : []
    }));
  }

  // Query 6: Similar result month avg IV > current IV
  async getSimilarResultAvgIvGreaterThanCurrent(): Promise<IVComparisonResult[]> {
    const query = `
      SELECT 
        symbol,
        sector,
        current_call_iv as currentCallIv,
        similar_results_avg_iv as comparisonValue,
        (similar_results_avg_iv - current_call_iv) as difference,
        CASE 
          WHEN current_call_iv > 0 THEN ((similar_results_avg_iv - current_call_iv) / current_call_iv * 100)
          ELSE 0 
        END as percentageChange,
        instrument_type as instrumentType
      FROM market_summary 
      WHERE similar_results_avg_iv > current_call_iv
        AND similar_results_avg_iv > 0
        AND instrument_type = 'STOCK'
      ORDER BY percentageChange DESC
    `;

    return await this.marketSummaryRepository.query(query);
  }

  // Query 7: Similar result month avg IV < current IV
  async getSimilarResultAvgIvLessThanCurrent(): Promise<IVComparisonResult[]> {
    const query = `
      SELECT 
        symbol,
        sector,
        current_call_iv as currentCallIv,
        similar_results_avg_iv as comparisonValue,
        (current_call_iv - similar_results_avg_iv) as difference,
        CASE 
          WHEN similar_results_avg_iv > 0 THEN ((current_call_iv - similar_results_avg_iv) / similar_results_avg_iv * 100)
          ELSE 0 
        END as percentageChange,
        instrument_type as instrumentType
      FROM market_summary 
      WHERE similar_results_avg_iv < current_call_iv
        AND similar_results_avg_iv > 0
        AND instrument_type = 'STOCK'
      ORDER BY percentageChange DESC
    `;

    return await this.marketSummaryRepository.query(query);
  }

  // Query 8: Result in this month and similar result avg IV < current IV
  async getThisMonthResultsWithHighIV(): Promise<IVComparisonResult[]> {
    const query = `
      SELECT 
        symbol,
        sector,
        current_call_iv as currentCallIv,
        similar_results_avg_iv as comparisonValue,
        (current_call_iv - similar_results_avg_iv) as difference,
        CASE 
          WHEN similar_results_avg_iv > 0 THEN ((current_call_iv - similar_results_avg_iv) / similar_results_avg_iv * 100)
          ELSE 0 
        END as percentageChange,
        instrument_type as instrumentType
      FROM market_summary 
      WHERE result_month = DATE_FORMAT(NOW(), '%Y-%m')
        AND similar_results_avg_iv < current_call_iv
        AND similar_results_avg_iv > 0
        AND instrument_type = 'STOCK'
      ORDER BY percentageChange DESC
    `;

    return await this.marketSummaryRepository.query(query);
  }

  // Query 9: Index current IV > last one week's IV
  async getIndexCurrentIvGreaterThanWeekly(): Promise<IVComparisonResult[]> {
    const query = `
      SELECT 
        symbol,
        sector,
        current_call_iv as currentCallIv,
        avg_7day_call_iv as comparisonValue,
        (current_call_iv - avg_7day_call_iv) as difference,
        CASE 
          WHEN avg_7day_call_iv > 0 THEN ((current_call_iv - avg_7day_call_iv) / avg_7day_call_iv * 100)
          ELSE 0 
        END as percentageChange,
        instrument_type as instrumentType
      FROM market_summary 
      WHERE current_call_iv > avg_7day_call_iv
        AND instrument_type = 'INDEX'
      ORDER BY percentageChange DESC
    `;

    return await this.marketSummaryRepository.query(query);
  }

  // Query 10: Index current IV < last one week's IV
  async getIndexCurrentIvLessThanWeekly(): Promise<IVComparisonResult[]> {
    const query = `
      SELECT 
        symbol,
        sector,
        current_call_iv as currentCallIv,
        avg_7day_call_iv as comparisonValue,
        (avg_7day_call_iv - current_call_iv) as difference,
        CASE 
          WHEN current_call_iv > 0 THEN ((avg_7day_call_iv - current_call_iv) / current_call_iv * 100)
          ELSE 0 
        END as percentageChange,
        instrument_type as instrumentType
      FROM market_summary 
      WHERE current_call_iv < avg_7day_call_iv
        AND instrument_type = 'INDEX'
      ORDER BY percentageChange DESC
    `;

    return await this.marketSummaryRepository.query(query);
  }

  // NEW: Dynamic IV Comparison with flexible time periods
  async getDynamicIvComparison(days: number, operator: 'gt' | 'lt' | 'eq' = 'gt'): Promise<IVComparisonResult[]> {
    this.logger.log(`Executing dynamic IV comparison for ${days} days with operator ${operator}`);
    
    try {
      const comparisonOperator = operator === 'gt' ? '>' : operator === 'lt' ? '<' : '=';
      const orderDirection = operator === 'lt' ? 'ASC' : 'DESC';
      
      const query = `
        SELECT 
          ms.symbol,
          ms.sector,
          ms.current_call_iv as currentCallIv,
          ROUND(COALESCE(nv_avg.avg_vol, 0), 2) as comparisonValue,
          ROUND((ms.current_call_iv - COALESCE(nv_avg.avg_vol, 0)), 2) as difference,
          CASE 
            WHEN COALESCE(nv_avg.avg_vol, 0) > 0 
            THEN ROUND(((ms.current_call_iv - nv_avg.avg_vol) / nv_avg.avg_vol * 100), 2)
            ELSE 0 
          END as percentageChange,
          ms.instrument_type as instrumentType
        FROM market_summary ms
        LEFT JOIN (
          SELECT 
            'DEFAULT' as symbol_match,
            AVG(ATM_vol) as avg_vol
          FROM nse_vol 
          WHERE date >= (
            SELECT DATE_SUB(MAX(date), INTERVAL ${days} DAY) 
            FROM nse_vol WHERE ATM_vol > 0
          )
          AND ATM_vol > 0
        ) nv_avg ON 1=1
        WHERE ms.current_call_iv ${comparisonOperator} COALESCE(nv_avg.avg_vol, 0)
          AND ms.instrument_type = 'STOCK'
          AND COALESCE(nv_avg.avg_vol, 0) > 0
        ORDER BY ABS(percentageChange) ${orderDirection}
        LIMIT 50
      `;

      const results = await this.marketSummaryRepository.query(query);
      this.logger.log(`Dynamic IV comparison completed, returned ${results.length} results`);
      return results;
    } catch (error) {
      this.logger.error('Failed to execute dynamic IV comparison', error.stack);
      throw new Error(`Database query failed: ${error.message}`);
    }
  }
  
  // Utility method: Get all available sectors
  async getAvailableSectors(): Promise<string[]> {
    this.logger.log('Fetching available sectors');
    
    try {
      const query = `
        SELECT DISTINCT sector 
        FROM market_summary 
        WHERE sector IS NOT NULL 
          AND sector != 'Unknown'
        ORDER BY sector
      `;

      const results = await this.marketSummaryRepository.query(query);
      this.logger.log(`Found ${results.length} available sectors`);
      return results.map(r => r.sector);
    } catch (error) {
      this.logger.error('Failed to fetch available sectors', error.stack);
      throw new Error(`Database query failed: ${error.message}`);
    }
  }
}
