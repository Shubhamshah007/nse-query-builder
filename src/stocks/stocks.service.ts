import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from '../entities/stock.entity';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Injectable()
export class StocksService {
  constructor(
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
  ) {}

  async create(createStockDto: CreateStockDto): Promise<Stock> {
    const stock = this.stockRepository.create(createStockDto);
    return await this.stockRepository.save(stock);
  }

  async findAll(): Promise<Stock[]> {
    return await this.stockRepository.find({
      order: { symbol: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Stock> {
    const stock = await this.stockRepository.findOne({ where: { id } });
    if (!stock) {
      throw new NotFoundException(`Stock with ID ${id} not found`);
    }
    return stock;
  }

  async findBySymbol(symbol: string): Promise<Stock> {
    const stock = await this.stockRepository.findOne({ 
      where: { symbol: symbol.toUpperCase() } 
    });
    if (!stock) {
      throw new NotFoundException(`Stock with symbol ${symbol} not found`);
    }
    return stock;
  }

  async findBySector(sector: string): Promise<Stock[]> {
    return await this.stockRepository.find({
      where: { sector },
      order: { symbol: 'ASC' },
    });
  }

  async update(id: string, updateStockDto: UpdateStockDto): Promise<Stock> {
    await this.stockRepository.update(id, updateStockDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.stockRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Stock with ID ${id} not found`);
    }
  }

  async search(query: string): Promise<Stock[]> {
    return await this.stockRepository
      .createQueryBuilder('stock')
      .where('stock.symbol LIKE :query OR stock.companyName LIKE :query', {
        query: `%${query}%`,
      })
      .orderBy('stock.symbol', 'ASC')
      .getMany();
  }
}
