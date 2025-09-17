import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { MarketIndex } from './index.entity';

@Entity('index_data')
@Index(['index', 'date'], { unique: true })
@Index(['date'])
export class IndexData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('date')
  date: Date; // Trading date

  @Column('decimal', { precision: 12, scale: 2 })
  open: number; // Opening value

  @Column('decimal', { precision: 12, scale: 2 })
  high: number; // Highest value of the day

  @Column('decimal', { precision: 12, scale: 2 })
  low: number; // Lowest value of the day

  @Column('decimal', { precision: 12, scale: 2 })
  close: number; // Closing value

  @Column('decimal', { precision: 8, scale: 4, nullable: true })
  change: number; // Points change

  @Column('decimal', { precision: 8, scale: 4, nullable: true })
  changePercent: number; // Percentage change

  @Column('bigint', { nullable: true })
  volume: number; // Total volume of constituent stocks

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  turnover: number; // Total turnover

  @CreateDateColumn()
  createdAt: Date;

  // Relationships
  @ManyToOne(() => MarketIndex, (index) => index.indexHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'index_id' })
  index: MarketIndex;
}