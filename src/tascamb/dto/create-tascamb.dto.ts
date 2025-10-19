import { IsString, IsNumber, Min, IsNotEmpty } from 'class-validator';

export class CreateTasaCambioDto {
  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsNumber()
  @Min(0)
  rateToUSD: number;
}