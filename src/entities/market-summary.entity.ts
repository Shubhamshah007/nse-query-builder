import {
  Entity,
  Column,
  PrimaryColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum InstrumentType {
  STOCK = 'STOCK',
  INDEX = 'INDEX',
}

@Entity('market_summary')
@Index(['sector'])
@Index(['instrumentType'])
@Index(['resultMonth'])
export class MarketSummary {
  @PrimaryColumn({ length: 32 })
  symbol: string;

  @Column('float', { default: 0, name: 'current_call_iv' })
  currentCallIv: number;

  @Column('float', { default: 0, name: 'current_put_iv' })
  currentPutIv: number;

  @Column('float', { default: 0, name: 'current_price' })
  currentPrice: number;

  @Column('float', { default: 0, name: 'yesterday_close_call_iv' })
  yesterdayCloseCallIv: number;

  @Column('float', { default: 0, name: 'today_930_call_iv' })
  today930CallIv: number;

  @Column({ length: 50, nullable: true, default: 'Unknown' })
  sector: string;

  @Column({
    type: 'enum',
    enum: InstrumentType,
    nullable: true,
    default: InstrumentType.STOCK,
    name: 'instrument_type',
  })
  instrumentType: InstrumentType;

  @Column({ length: 7, nullable: true, name: 'result_month' })
  resultMonth: string;

  @Column('float', { default: 0, name: 'similar_results_avg_iv' })
  similarResultsAvgIv: number;

  @Column('boolean', { default: false, name: 'is_expiry_week' })
  isExpiryWeek: boolean;

  @UpdateDateColumn({ 
    type: 'timestamp', 
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    name: 'last_updated'
  })
  lastUpdated: Date;
}