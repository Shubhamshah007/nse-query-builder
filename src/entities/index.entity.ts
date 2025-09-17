import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { IndexData } from './index-data.entity';

@Entity('indices')
@Index(['symbol'], { unique: true })
export class MarketIndex {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  symbol: string; // e.g., 'NIFTY 50', 'NIFTY BANK', 'SENSEX'

  @Column({ length: 200 })
  name: string; // Full name of the index

  @Column({ length: 200, nullable: true })
  description: string;

  @Column({ length: 50, nullable: true })
  exchange: string; // NSE, BSE

  @Column({ length: 20, nullable: true })
  baseDate: string; // Base date of the index

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  baseValue: number; // Base value of the index

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => IndexData, (indexData) => indexData.index, {
    cascade: true,
  })
  indexHistory: IndexData[];
}