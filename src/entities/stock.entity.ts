import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { PriceData } from './price-data.entity';

@Entity('stocks')
@Index(['symbol'], { unique: true })
@Index(['sector'])
@Index(['marketCap'])
export class Stock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  symbol: string; // e.g., 'RELIANCE', 'TCS', 'INFY'

  @Column({ length: 200 })
  companyName: string; // e.g., 'Reliance Industries Limited'

  @Column({ length: 100, nullable: true })
  sector: string; // e.g., 'Oil & Gas', 'IT Services'

  @Column({ length: 100, nullable: true })
  industry: string; // e.g., 'Refineries', 'Software Services'

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  marketCap: number; // Market capitalization in crores

  @Column({ nullable: true })
  isin: string; // International Securities Identification Number

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  faceValue: number;

  @Column('bigint', { nullable: true })
  sharesOutstanding: number;

  @Column({ default: true })
  isActive: boolean; // Whether the stock is actively traded

  @Column({ length: 10, default: 'EQ' })
  series: string; // EQ, BE, etc.

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => PriceData, (priceData) => priceData.stock, {
    cascade: true,
  })
  priceHistory: PriceData[];
}