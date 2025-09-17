import { Module } from '@nestjs/common';
import { PriceDataService } from './price-data.service';
import { PriceDataController } from './price-data.controller';

@Module({
  providers: [PriceDataService],
  controllers: [PriceDataController]
})
export class PriceDataModule {}
