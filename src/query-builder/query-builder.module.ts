import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueryBuilderController } from './query-builder.controller';
import { QueryBuilderService } from './query-builder.service';
import { DynamicQueryService } from './services/dynamic-query.service';
import { MarketSummary } from '../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([MarketSummary])
  ],
  controllers: [QueryBuilderController],
  providers: [QueryBuilderService, DynamicQueryService],
  exports: [QueryBuilderService, DynamicQueryService],
})
export class QueryBuilderModule {}
