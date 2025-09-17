import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { StocksService } from './stocks.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { Stock } from '../entities/stock.entity';

@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Post()
  async create(
    @Body(new ValidationPipe()) createStockDto: CreateStockDto,
  ): Promise<Stock> {
    return this.stocksService.create(createStockDto);
  }

  @Get()
  async findAll(@Query('sector') sector?: string): Promise<Stock[]> {
    if (sector) {
      return this.stocksService.findBySector(sector);
    }
    return this.stocksService.findAll();
  }

  @Get('search')
  async search(@Query('q') query: string): Promise<Stock[]> {
    return this.stocksService.search(query);
  }

  @Get('symbol/:symbol')
  async findBySymbol(@Param('symbol') symbol: string): Promise<Stock> {
    return this.stocksService.findBySymbol(symbol);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Stock> {
    return this.stocksService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateStockDto: UpdateStockDto,
  ): Promise<Stock> {
    return this.stocksService.update(id, updateStockDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.stocksService.remove(id);
    return { message: 'Stock deleted successfully' };
  }
}
