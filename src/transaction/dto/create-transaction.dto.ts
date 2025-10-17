import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  transactionType: string; // "deposit" o "withdraw"

  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  cardId: number; // ID de la tarjeta asociada
}