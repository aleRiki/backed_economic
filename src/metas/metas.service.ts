import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Meta } from './entities/meta.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateMetaDto } from './dto/create-meta.dto';
import { UpdateMetaDto } from './dto/update-meta.dto';
import { Presupuesto } from 'src/presupuesto/entities/presupuesto.entity';

@Injectable()
export class MetasService {
  constructor(
    @InjectRepository(Meta)
    private readonly metaRepository: Repository<Meta>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Presupuesto)
    private readonly presupuestoRepository: Repository<Presupuesto>,
  ) {}

  // ✅ CREATE
  async create(dto: CreateMetaDto, userId: number) {
    const presupuesto = await this.presupuestoRepository.findOne({
      where: { id: dto.presupuestoId },
    });

    if (!presupuesto) {
      throw new NotFoundException('Presupuesto no encontrado');
    }

    // 🔹 BUSCAR EL USUARIO REAL
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const meta = this.metaRepository.create({
      name: dto.name,
      description: dto.description,
      presupuesto,
      users: [user], // ✅ AHORA SÍ
    });

    return this.metaRepository.save(meta);
  }

  // ✅ FIND ALL
 async findAll(currentUser: User) {
  return this.metaRepository.find({
    relations: ['users', 'presupuesto'],
    where: {
      users: { id: currentUser.id },
    },
  });
}

  // ✅ FIND ONE
  async findOne(id: number, currentUser: User) {
    const meta = await this.metaRepository.findOne({
      where: {
        id,
        users: { id: currentUser.id }, // solo si pertenece al usuario
      },
      relations: ['users', 'presupuesto'],
    });

    if (!meta) {
      throw new NotFoundException(
        `Meta con id ${id} no encontrada para este usuario`,
      );
    }

    return meta;
  }

  // ✅ UPDATE
  async update(id: number, dto: UpdateMetaDto, currentUser: User) {
    const meta = await this.findOne(id, currentUser); // validar propiedad

    Object.assign(meta, dto);

    if (dto.userIds) {
      meta.users = await this.userRepository.find({
        where: { id: In(dto.userIds) },
      });
    }

    if (dto.progreso !== undefined) {
      meta.presupuesto.porcentajeCumplido = dto.progreso;
      await this.presupuestoRepository.save(meta.presupuesto);
    }

    return this.metaRepository.save(meta);
  }

  // ✅ REMOVE (soft delete opcional)
  async remove(id: number, currentUser: User) {
    const meta = await this.findOne(id, currentUser); // validar propiedad
    return this.metaRepository.remove(meta);
  }
}
