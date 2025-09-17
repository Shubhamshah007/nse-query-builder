import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, MaxLength } from 'class-validator';

export class CreateStockDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  symbol: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  companyName: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  sector?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  industry?: string;

  @IsNumber()
  @IsOptional()
  marketCap?: number;

  @IsString()
  @IsOptional()
  isin?: string;

  @IsNumber()
  @IsOptional()
  faceValue?: number;

  @IsNumber()
  @IsOptional()
  sharesOutstanding?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  series?: string;
}