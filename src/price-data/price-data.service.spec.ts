import { Test, TestingModule } from '@nestjs/testing';
import { PriceDataService } from './price-data.service';

describe('PriceDataService', () => {
  let service: PriceDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PriceDataService],
    }).compile();

    service = module.get<PriceDataService>(PriceDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
