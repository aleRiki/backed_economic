import { PartialType } from '@nestjs/mapped-types';
import { CreatePresupuestoDto } from './create-presupuesto.dto';
import { IsInt, IsOptional, IsArray, IsNumber, Min, Max } from 'class-validator';

export class UpdatePresupuestoDto extends PartialType(CreatePresupuestoDto) {
  
  // Permitir actualizar los usuarios asociados
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  userIds?: number[];

  // 🔹 Permitir actualizar el progreso del presupuesto (0 a 100)
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  porcentajeCumplido?: number;
}
