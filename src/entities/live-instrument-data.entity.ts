import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('live_instrument_data')
@Index(['symbol'])
@Index(['timestamp'])
export class LiveInstrumentData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 32 })
  symbol: string;

  @Column('int')
  scrip: number;

  @Column({ length: 32 })
  segment: string;

  @Column('float', { nullable: true, name: 'underlying_price' })
  underlyingPrice: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Column({ length: 32, nullable: true })
  expiry: string;

  @Column({ length: 16, nullable: true, default: 'success', name: 'data_status' })
  dataStatus: string;

  @Column('float', { nullable: true, name: 'fetch_duration' })
  fetchDuration: number;
}