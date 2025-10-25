import { IsNumber, IsString, IsNotEmpty, IsIn } from 'class-validator';
import { TransactionType } from '../enum/transaction-type.enum';
import { TransactionCategory } from '../enum/transaction-category.enum';
import { Transform } from 'class-transformer';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  @IsIn([TransactionType.DEPOSIT, TransactionType.WITHDRAW])
  @Transform(({ value }) => String(value).toLowerCase())
  transactionType: TransactionType; 
  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(TransactionCategory)) 
  category: TransactionCategory;
  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  cardId: number;
}
