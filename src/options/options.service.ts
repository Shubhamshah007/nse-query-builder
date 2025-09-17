import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LatestData, LiveInstrumentData, LiveOptionStrikes, MarketSummary, InstrumentType } from '../entities';

export interface OptionsChainResult {
  symbol: string;
  underlyingPrice: number;
  expiry: string;
  strikes: {
    strike: number;
    callLtp: number;
    callOi: number;
    callIv: number;
    putLtp: number;
    putOi: number;
    putIv: number;
    isAtm: boolean;
  }[];
}

export interface ImpliedVolatilityAnalysis {
  symbol: string;
  currentCallIv: number;
  currentPutIv: number;
  avg14dayCallIv: number;
  avg21dayCallIv: number;
  sector: string;
  instrumentType: string;
  ivRank: number; // Where current IV stands relative to historical range
}

@Injectable()
export class OptionsService {
  constructor(
    @InjectRepository(LatestData)
    private latestDataRepository: Repository<LatestData>,
    @InjectRepository(LiveInstrumentData)
    private liveInstrumentRepository: Repository<LiveInstrumentData>,
    @InjectRepository(LiveOptionStrikes)
    private optionStrikesRepository: Repository<LiveOptionStrikes>,
    @InjectRepository(MarketSummary)
    private marketSummaryRepository: Repository<MarketSummary>,
  ) {}

  async getOptionsChain(symbol: string, expiry?: string): Promise<OptionsChainResult> {
    // Get latest data for underlying price
    const latestData = await this.latestDataRepository.findOne({
      where: { symbol: symbol.toUpperCase() },
    });

    if (!latestData) {
      throw new Error(`Symbol ${symbol} not found in latest data`);
    }

    // Build query for option strikes
    const whereClause: any = { symbol: symbol.toUpperCase() };
    if (expiry) {
      whereClause.expiry = expiry;
    } else if (latestData.expiry) {
      whereClause.expiry = latestData.expiry;
    }

    const strikes = await this.optionStrikesRepository.find({
      where: whereClause,
      order: { strike: 'ASC' },
    });

    return {
      symbol: symbol.toUpperCase(),
      underlyingPrice: latestData.underlyingPrice,
      expiry: latestData.expiry,
      strikes: strikes.map(strike => ({
        strike: strike.strike,
        callLtp: strike.callLtp,
        callOi: strike.callOi,
        callIv: strike.callIv,
        putLtp: strike.putLtp,
        putOi: strike.putOi,
        putIv: strike.putIv,
        isAtm: strike.isAtm,
      })),
    };
  }

  async getImpliedVolatilityAnalysis(symbol: string): Promise<ImpliedVolatilityAnalysis> {
    const marketData = await this.marketSummaryRepository.findOne({
      where: { symbol: symbol.toUpperCase() },
    });

    if (!marketData) {
      throw new Error(`Market summary for ${symbol} not found`);
    }

    // Calculate IV rank based on current vs historical IVs
    const currentIv = marketData.currentCallIv;
    const ivs = [marketData.avg7dayCallIv, marketData.avg21dayCallIv, marketData.avg90dayCallIv];
    const maxIv = Math.max(...ivs, currentIv);
    const minIv = Math.min(...ivs, currentIv);
    const ivRank = maxIv > minIv ? ((currentIv - minIv) / (maxIv - minIv)) * 100 : 50;

    return {
      symbol: symbol.toUpperCase(),
      currentCallIv: marketData.currentCallIv,
      currentPutIv: marketData.currentPutIv,
      avg14dayCallIv: marketData.avg7dayCallIv, // Using 7-day as closest to 14-day preference
      avg21dayCallIv: marketData.avg21dayCallIv,
      sector: marketData.sector,
      instrumentType: marketData.instrumentType,
      ivRank: Math.round(ivRank),
    };
  }

  async getHighIVStocks(limit: number = 20): Promise<any[]> {
    return await this.marketSummaryRepository.find({
      where: { instrumentType: InstrumentType.STOCK },
      order: { currentCallIv: 'DESC' },
      take: limit,
    });
  }

  async getAtmStrikes(symbol: string): Promise<LiveOptionStrikes[]> {
    return await this.optionStrikesRepository.find({
      where: { 
        symbol: symbol.toUpperCase(),
        isAtm: true 
      },
    });
  }

  async getSectorIVAnalysis(): Promise<any[]> {
    const query = `
      SELECT 
        sector,
        COUNT(*) as stock_count,
        AVG(current_call_iv) as avg_call_iv,
        AVG(current_put_iv) as avg_put_iv,
        AVG(avg_21day_call_iv) as avg_21day_iv
      FROM market_summary
      WHERE sector IS NOT NULL 
        AND sector != 'Unknown'
        AND instrument_type = 'STOCK'
      GROUP BY sector
      ORDER BY avg_call_iv DESC
    `;

    return await this.marketSummaryRepository.query(query);
  }

  async getAvailableSymbols(): Promise<string[]> {
    const symbols = await this.latestDataRepository.find({
      select: ['symbol'],
      order: { symbol: 'ASC' },
    });
    
    return symbols.map(s => s.symbol);
  }
}
