import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsIn,
  Min,
  IsPositive,
} from 'class-validator';

export class CreateMetaDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsIn(['gasto', 'ahorro'])
  type: 'gasto' | 'ahorro';

  @IsNumber()
  @IsPositive()
  @Min(0)
  amount: number;

  @IsInt()
  @IsOptional()
  presupuestoId?: number;

  @IsInt()
  @IsOptional()
  cardId?: number;

  @IsInt()
  @IsOptional()
  accountId?: number;

  @IsInt({ each: true })
  @IsOptional()
  userIds?: number[];
}
