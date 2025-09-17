import {
  ViewEntity,
  ViewColumn,
} from 'typeorm';

@ViewEntity({ 
  name: 'latest_data',
  synchronize: false // Prevent TypeORM from trying to alter this VIEW
})
export class LatestData {
  @ViewColumn()
  symbol: string;

  @ViewColumn({ name: 'underlying_price' })
  underlyingPrice: number;

  @ViewColumn()
  expiry: string;

  @ViewColumn()
  timestamp: Date;

  @ViewColumn({ name: 'fetch_duration' })
  fetchDuration: number;
}
