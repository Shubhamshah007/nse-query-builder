import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceData, Stock } from '../entities';

export interface MovingAverageResult {
  symbol: string;
  date: Date;
  price: number;
  ma14: number;
  ma21: number;
  ma50?: number;
}

export interface TechnicalIndicators {
  symbol: string;
  currentPrice: number;
  ma14: number;
  ma21: number;
  ma50: number;
  volume: number;
  change: number;
  changePercent: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(PriceData)
    private priceDataRepository: Repository<PriceData>,
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
  ) {}

  async getMovingAverages(symbol: string, days: number = 50): Promise<MovingAverageResult[]> {
    const stock = await this.stockRepository.findOne({
      where: { symbol: symbol.toUpperCase() },
    });

    if (!stock) {
      throw new Error(`Stock ${symbol} not found`);
    }

    const priceData = await this.priceDataRepository.find({
      where: { stock: { id: stock.id } },
      order: { date: 'DESC' },
      take: days + 50, // Get extra data for accurate MA calculation
    });

    const results: MovingAverageResult[] = [];

    for (let i = 0; i < Math.min(days, priceData.length - 21); i++) {
      const currentData = priceData[i];
      
      // Calculate 14-day MA
      const ma14Data = priceData.slice(i, i + 14);
      const ma14 = ma14Data.reduce((sum, data) => sum + data.close, 0) / 14;
      
      // Calculate 21-day MA
      const ma21Data = priceData.slice(i, i + 21);
      const ma21 = ma21Data.reduce((sum, data) => sum + data.close, 0) / 21;
      
      // Calculate 50-day MA if enough data
      let ma50: number | undefined = undefined;
      if (priceData.length >= i + 50) {
        const ma50Data = priceData.slice(i, i + 50);
        ma50 = ma50Data.reduce((sum, data) => sum + data.close, 0) / 50;
      }

      results.push({
        symbol: symbol.toUpperCase(),
        date: currentData.date,
        price: currentData.close,
        ma14,
        ma21,
        ma50,
      });
    }

    return results.reverse(); // Return in chronological order
  }

  async getTechnicalIndicators(symbol: string): Promise<TechnicalIndicators> {
    const stock = await this.stockRepository.findOne({
      where: { symbol: symbol.toUpperCase() },
    });

    if (!stock) {
      throw new Error(`Stock ${symbol} not found`);
    }

    const recentData = await this.priceDataRepository.find({
      where: { stock: { id: stock.id } },
      order: { date: 'DESC' },
      take: 50,
    });

    if (recentData.length === 0) {
      throw new Error(`No price data found for ${symbol}`);
    }

    const latest = recentData[0];
    const previous = recentData[1];
    
    // Calculate moving averages
    const ma14 = recentData.slice(0, 14).reduce((sum, data) => sum + data.close, 0) / Math.min(14, recentData.length);
    const ma21 = recentData.slice(0, 21).reduce((sum, data) => sum + data.close, 0) / Math.min(21, recentData.length);
    const ma50 = recentData.reduce((sum, data) => sum + data.close, 0) / recentData.length;

    const change = previous ? latest.close - previous.close : 0;
    const changePercent = previous ? (change / previous.close) * 100 : 0;

    return {
      symbol: symbol.toUpperCase(),
      currentPrice: latest.close,
      ma14,
      ma21,
      ma50,
      volume: latest.volume,
      change,
      changePercent,
    };
  }

  async getTopPerformers(limit: number = 10): Promise<any[]> {
    const query = `
      SELECT 
        s.symbol,
        s.company_name,
        s.sector,
        p1.close as current_price,
        p2.close as previous_price,
        ((p1.close - p2.close) / p2.close * 100) as change_percent
      FROM stocks s
      JOIN price_data p1 ON s.id = p1.stock_id
      JOIN price_data p2 ON s.id = p2.stock_id
      WHERE p1.date = (SELECT MAX(date) FROM price_data WHERE stock_id = s.id)
        AND p2.date = (SELECT MAX(date) FROM price_data WHERE stock_id = s.id AND date < p1.date)
      ORDER BY change_percent DESC
      LIMIT ?
    `;

    return await this.priceDataRepository.query(query, [limit]);
  }

  async getSectorPerformance(): Promise<any[]> {
    const query = `
      SELECT 
        s.sector,
        COUNT(*) as stock_count,
        AVG(((p1.close - p2.close) / p2.close * 100)) as avg_change_percent,
        SUM(p1.volume) as total_volume
      FROM stocks s
      JOIN price_data p1 ON s.id = p1.stock_id
      JOIN price_data p2 ON s.id = p2.stock_id
      WHERE p1.date = (SELECT MAX(date) FROM price_data WHERE stock_id = s.id)
        AND p2.date = (SELECT MAX(date) FROM price_data WHERE stock_id = s.id AND date < p1.date)
        AND s.sector IS NOT NULL
      GROUP BY s.sector
      ORDER BY avg_change_percent DESC
    `;

    return await this.priceDataRepository.query(query);
  }
}
