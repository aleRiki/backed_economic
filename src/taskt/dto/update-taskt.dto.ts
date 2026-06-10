import { PartialType } from '@nestjs/swagger';
import { CreateTasktDto } from './create-taskt.dto';
import { IsOptional, IsNumber, IsBoolean, IsString } from 'class-validator';

export class UpdateTasktDto extends PartialType(CreateTasktDto) {
  @IsOptional()
  @IsNumber()
  spentAmount?: number;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @IsOptional()
  @IsString()
  type?: string;
}
