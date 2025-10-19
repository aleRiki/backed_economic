import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { TasaCambioService } from './tascamb.service'; 
import { CreateTasaCambioDto } from './dto/create-tascamb.dto'; 
import { UpdateTasaCambioDto } from './dto/update-tascamb.dto'; 
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Tasa de Cambio')
@Controller('tasa-cambio')
export class TasaCambioController {
  constructor(private readonly tasaCambioService: TasaCambioService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva tasa de cambio' })
  create(@Body() dto: CreateTasaCambioDto) {
    return this.tasaCambioService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las tasas de cambio' })
  findAll() {
    return this.tasaCambioService.findAll();
  }

  @Get(':currency')
  @ApiOperation({ summary: 'Obtener tasa de cambio por moneda (ej: CUP)' })
  findOne(@Param('currency') currency: string) {
    return this.tasaCambioService.findOne(currency.toUpperCase());
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar tasa de cambio por ID' })
  update(@Param('id') id: string, @Body() dto: UpdateTasaCambioDto) {
    return this.tasaCambioService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar tasa de cambio' })
  remove(@Param('id') id: string) {
    return this.tasaCambioService.remove(+id);
  }
}
