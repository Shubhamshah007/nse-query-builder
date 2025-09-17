import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OptionsController } from './options.controller';
import { OptionsService } from './options.service';
import { LatestData, LiveInstrumentData, LiveOptionStrikes, MarketSummary } from '../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([LatestData, LiveInstrumentData, LiveOptionStrikes, MarketSummary])
  ],
  controllers: [OptionsController],
  providers: [OptionsService],
  exports: [OptionsService],
})
export class OptionsModule {}
