import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService, MovingAverageResult, TechnicalIndicators } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('moving-averages/:symbol')
  async getMovingAverages(
    @Param('symbol') symbol: string,
    @Query('days') days?: string,
  ): Promise<MovingAverageResult[]> {
    const numDays = days ? parseInt(days, 10) : 50;
    return this.analyticsService.getMovingAverages(symbol, numDays);
  }

  @Get('technical-indicators/:symbol')
  async getTechnicalIndicators(@Param('symbol') symbol: string): Promise<TechnicalIndicators> {
    return this.analyticsService.getTechnicalIndicators(symbol);
  }

  @Get('top-performers')
  async getTopPerformers(@Query('limit') limit?: string) {
    const numLimit = limit ? parseInt(limit, 10) : 10;
    return this.analyticsService.getTopPerformers(numLimit);
  }

  @Get('sector-performance')
  async getSectorPerformance() {
    return this.analyticsService.getSectorPerformance();
  }
}
