import { IsString, IsNotEmpty, IsPositive, IsNumber } from 'class-validator';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  number: string;

  @IsNumber({}, { message: 'Account ID must be a number' })
  @IsPositive()
  @IsNotEmpty()
  account: number;
}
