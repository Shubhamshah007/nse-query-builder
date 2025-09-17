import { Test, TestingModule } from '@nestjs/testing';
import { PriceDataController } from './price-data.controller';

describe('PriceDataController', () => {
  let controller: PriceDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PriceDataController],
    }).compile();

    controller = module.get<PriceDataController>(PriceDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
