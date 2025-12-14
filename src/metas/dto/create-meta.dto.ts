import { IsInt, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateMetaDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description: string;

  @IsInt()
  presupuestoId: number;

  @IsInt({ each: true })
  @IsOptional()
  userIds?: number[];
}
