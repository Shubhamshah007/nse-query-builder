import { Controller, Get, Param, Query } from '@nestjs/common';
import { OptionsService, OptionsChainResult, ImpliedVolatilityAnalysis } from './options.service';
import { LiveOptionStrikes } from '../entities';

@Controller('options')
export class OptionsController {
  constructor(private readonly optionsService: OptionsService) {}

  @Get('symbols')
  async getAvailableSymbols(): Promise<string[]> {
    return this.optionsService.getAvailableSymbols();
  }

  @Get('chain/:symbol')
  async getOptionsChain(
    @Param('symbol') symbol: string,
    @Query('expiry') expiry?: string,
  ): Promise<OptionsChainResult> {
    return this.optionsService.getOptionsChain(symbol, expiry);
  }

  @Get('iv-analysis/:symbol')
  async getImpliedVolatilityAnalysis(
    @Param('symbol') symbol: string,
  ): Promise<ImpliedVolatilityAnalysis> {
    return this.optionsService.getImpliedVolatilityAnalysis(symbol);
  }

  @Get('high-iv')
  async getHighIVStocks(@Query('limit') limit?: string) {
    const numLimit = limit ? parseInt(limit, 10) : 20;
    return this.optionsService.getHighIVStocks(numLimit);
  }

  @Get('atm/:symbol')
  async getAtmStrikes(@Param('symbol') symbol: string): Promise<LiveOptionStrikes[]> {
    return this.optionsService.getAtmStrikes(symbol);
  }

  @Get('sector-iv-analysis')
  async getSectorIVAnalysis() {
    return this.optionsService.getSectorIVAnalysis();
  }
}
