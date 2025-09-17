import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StocksModule } from './stocks/stocks.module';
import { PriceDataModule } from './price-data/price-data.module';
import { QueryBuilderModule } from './query-builder/query-builder.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { Stock, PriceData, MarketIndex, IndexData, LatestData, LiveInstrumentData, LiveOptionStrikes, MarketSummary } from './entities';
import { OptionsModule } from './options/options.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(
      // Use DATABASE_URL for Railway PostgreSQL, fallback to MySQL for local
      process.env.DATABASE_URL
        ? {
            type: 'postgres',
            url: process.env.DATABASE_URL,
            entities: [Stock, PriceData, MarketIndex, IndexData, LatestData, LiveInstrumentData, LiveOptionStrikes, MarketSummary],
            synchronize: true, // Temporarily enable to create tables
            logging: process.env.DATABASE_LOGGING === 'true',
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
          }
        : {
            type: 'mysql',
            host: process.env.DATABASE_HOST || 'localhost',
            port: parseInt(process.env.DATABASE_PORT || '3306'),
            username: process.env.DATABASE_USER || 'root',
            password: process.env.DATABASE_PASSWORD || '',
            database: process.env.DATABASE_NAME || 'option_data',
            entities: [Stock, PriceData, MarketIndex, IndexData, LatestData, LiveInstrumentData, LiveOptionStrikes, MarketSummary],
            synchronize: false,
            logging: process.env.DATABASE_LOGGING === 'true',
            extra: {
              charset: 'utf8mb4_unicode_ci',
            },
          }
    ),
    StocksModule,
    PriceDataModule,
    QueryBuilderModule,
    AnalyticsModule,
    OptionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
