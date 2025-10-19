import { PartialType } from '@nestjs/mapped-types';
import { CreateTasaCambioDto } from './create-tascamb.dto';

export class UpdateTasaCambioDto extends PartialType(CreateTasaCambioDto) {}
