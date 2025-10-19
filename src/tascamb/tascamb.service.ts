import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TasaCambio } from './entities/tascamb.entity'; 
import { CreateTasaCambioDto } from './dto/create-tascamb.dto'; 
import { UpdateTasaCambioDto } from './dto/update-tascamb.dto'; 
@Injectable()
export class TasaCambioService {
  constructor(
    @InjectRepository(TasaCambio)
    private tasaCambioRepository: Repository<TasaCambio>,
  ) {}

  async create(dto: CreateTasaCambioDto) {
    const newRate = this.tasaCambioRepository.create(dto);
    return this.tasaCambioRepository.save(newRate);
  }

  async findAll() {
    return this.tasaCambioRepository.find();
  }

  async findOne(currency: string) {
    const rate = await this.tasaCambioRepository.findOne({ where: { currency } });
    if (!rate) throw new NotFoundException(`No se encontró tasa para ${currency}`);
    return rate;
  }

  async update(id: number, dto: UpdateTasaCambioDto) {
    const tasa = await this.tasaCambioRepository.findOne({ where: { id } });
    if (!tasa) throw new NotFoundException('Tasa no encontrada');
    Object.assign(tasa, dto);
    return this.tasaCambioRepository.save(tasa);
  }

  async remove(id: number) {
    const tasa = await this.tasaCambioRepository.findOne({ where: { id } });
    if (!tasa) throw new NotFoundException('Tasa no encontrada');
    await this.tasaCambioRepository.remove(tasa);
    return { message: 'Tasa eliminada correctamente' };
  }
}
