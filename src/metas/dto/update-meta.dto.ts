import { PartialType } from '@nestjs/swagger';
import { CreateMetaDto } from './create-meta.dto';
import { IsOptional, IsArray, IsInt, IsNumber, Min, Max, IsBoolean, IsString, IsIn } from 'class-validator';

export class UpdateMetaDto extends PartialType(CreateMetaDto) {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  userIds?: number[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progreso?: number;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['gasto', 'ahorro'])
  type?: 'gasto' | 'ahorro';
}
