import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  name: string;
  @IsString()
  type: string;
  @IsNumber()
  balance: number;

  @IsEnum(['personal', 'familiar'])
  typeAccount: 'personal' | 'familiar';

  @IsOptional()
  @IsArray()
  userIds?: number[]; // solo si es familiar

  @IsNumber()
  bankId: number;
}
