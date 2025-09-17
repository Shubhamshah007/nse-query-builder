import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { LiveInstrumentData } from './live-instrument-data.entity';

@Entity('live_option_strikes')
@Index(['symbol'])
@Index(['strike'])
@Index(['isAtm'])
export class LiveOptionStrikes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { nullable: true, name: 'instrument_id' })
  instrumentId: number;

  @Column({ length: 32 })
  symbol: string;

  @Column('double')
  strike: number;

  // Call Options Data
  @Column('double', { nullable: true, default: 0, name: 'call_ltp' })
  callLtp: number;

  @Column('bigint', { nullable: true, default: 0, name: 'call_oi' })
  callOi: number;

  @Column('bigint', { nullable: true, default: 0, name: 'call_volume' })
  callVolume: number;

  @Column('double', { nullable: true, default: 0, name: 'call_iv' })
  callIv: number;

  @Column('double', { nullable: true, default: 0, name: 'call_delta' })
  callDelta: number;

  @Column('double', { nullable: true, default: 0, name: 'call_theta' })
  callTheta: number;

  @Column('double', { nullable: true, default: 0, name: 'call_gamma' })
  callGamma: number;

  @Column('double', { nullable: true, default: 0, name: 'call_vega' })
  callVega: number;

  // Put Options Data
  @Column('double', { nullable: true, default: 0, name: 'put_ltp' })
  putLtp: number;

  @Column('bigint', { nullable: true, default: 0, name: 'put_oi' })
  putOi: number;

  @Column('bigint', { nullable: true, default: 0, name: 'put_volume' })
  putVolume: number;

  @Column('double', { nullable: true, default: 0, name: 'put_iv' })
  putIv: number;

  @Column('double', { nullable: true, default: 0, name: 'put_delta' })
  putDelta: number;

  @Column('double', { nullable: true, default: 0, name: 'put_theta' })
  putTheta: number;

  @Column('double', { nullable: true, default: 0, name: 'put_gamma' })
  putGamma: number;

  @Column('double', { nullable: true, default: 0, name: 'put_vega' })
  putVega: number;

  @Column('date', { name: 'Date' })
  date: Date;

  @Column('time', { name: 'Time' })
  time: string;

  @Column('boolean', { default: false, name: 'is_atm' })
  isAtm: boolean;

  @Column({ length: 32, nullable: true })
  expiry: string;

  // Relationships
  @ManyToOne(() => LiveInstrumentData, { nullable: true })
  @JoinColumn({ name: 'instrument_id' })
  instrument: LiveInstrumentData;
}