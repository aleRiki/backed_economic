import { IsInt, IsNotEmpty, IsNumber, IsString, IsPositive, IsOptional } from 'class-validator';

export class CreatePresupuestoDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsPositive()
  presupuesto: number;

  // Relación ManyToOne con Card
  @IsInt()
  @IsNotEmpty()
  cardId: number;

  // Relación ManyToMany con User (opcional)
  @IsOptional()
  @IsInt({ each: true })
  userIds?: number[];
}
