import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export enum TypeAccountEnum {
  PERSONAL = 'personal',
  FAMILIAR = 'familiar',
}

export class CreateAccountDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsNumber()
  balance: number;

  @IsEnum(TypeAccountEnum)
  typeAccount: TypeAccountEnum;

  @IsOptional()
  @IsArray()
  userIds?: number[]; 

  @IsNumber()
  bankId: number;
}
