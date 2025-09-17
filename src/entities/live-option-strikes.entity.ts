import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';

@Entity('live_option_strikes')
@Index(['symbol'])
@Index(['date'])
@Index(['expiry'])
@Index(['is_atm'])
@Index(['symbol', 'date'])
@Index(['symbol', 'expiry'])
export class LiveOptionStrikes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { nullable: true, name: 'instrument_id' })
  instrumentId?: number;

  @Column({ length: 32, name: 'symbol' })
  symbol: string;

  @Column('double', { name: 'strike' })
  strike: number;

  @Column('double', { default: 0, nullable: true, name: 'call_ltp' })
  callLtp?: number;

  @Column('bigint', { default: 0, nullable: true, name: 'call_volume' })
  callVolume?: number;

  @Column('double', { default: 0, nullable: true, name: 'call_iv' })
  callIv?: number;

  @Column('double', { default: 0, nullable: true, name: 'call_delta' })
  callDelta?: number;

  @Column('double', { default: 0, nullable: true, name: 'call_theta' })
  callTheta?: number;

  @Column('double', { default: 0, nullable: true, name: 'call_gamma' })
  callGamma?: number;

  @Column('double', { default: 0, nullable: true, name: 'call_vega' })
  callVega?: number;

  @Column('double', { default: 0, nullable: true, name: 'put_ltp' })
  putLtp?: number;

  @Column('bigint', { default: 0, nullable: true, name: 'put_volume' })
  putVolume?: number;

  @Column('double', { default: 0, nullable: true, name: 'put_iv' })
  putIv?: number;

  @Column('double', { default: 0, nullable: true, name: 'put_delta' })
  putDelta?: number;

  @Column('double', { default: 0, nullable: true, name: 'put_theta' })
  putTheta?: number;

  @Column('double', { default: 0, nullable: true, name: 'put_gamma' })
  putGamma?: number;

  @Column('double', { default: 0, nullable: true, name: 'put_vega' })
  putVega?: number;

  @Column('date', { name: 'Date' })
  date: Date;

  @Column('time', { name: 'Time' })
  time: string;

  @Column('boolean', { default: false, name: 'is_atm' })
  isAtm: boolean;

  @Column({ length: 32, nullable: true, name: 'expiry' })
  expiry?: string;
}