import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { Stock } from './stock.entity';

@Entity('price_data')
@Index(['stock', 'date'], { unique: true })
@Index(['date'])
@Index(['volume'])
export class PriceData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('date')
  date: Date; // Trading date

  @Column('decimal', { precision: 10, scale: 2 })
  open: number; // Opening price

  @Column('decimal', { precision: 10, scale: 2 })
  high: number; // Highest price of the day

  @Column('decimal', { precision: 10, scale: 2 })
  low: number; // Lowest price of the day

  @Column('decimal', { precision: 10, scale: 2 })
  close: number; // Closing price

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  adjustedClose: number; // Adjusted closing price

  @Column('bigint')
  volume: number; // Number of shares traded

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  turnover: number; // Total turnover in rupees

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  vwap: number; // Volume Weighted Average Price

  @Column('int', { nullable: true })
  trades: number; // Number of trades

  @Column('decimal', { precision: 8, scale: 4, nullable: true })
  deliveryPercentage: number; // Delivery percentage

  @Column({ length: 10, default: 'EQ' })
  series: string; // Trading series

  @CreateDateColumn()
  createdAt: Date;

  // Relationships
  @ManyToOne(() => Stock, (stock) => stock.priceHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'stock_id' })
  stock: Stock;
}