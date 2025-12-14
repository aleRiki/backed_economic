import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Presupuesto } from './entities/presupuesto.entity';
import { Card } from 'src/card/entities/card.entity';
import { User } from 'src/users/entities/user.entity';

import { CreatePresupuestoDto } from './dto/create-presupuesto.dto';
import { UpdatePresupuestoDto } from './dto/update-presupuesto.dto';

@Injectable()
export class PresupuestoService {
  constructor(
    @InjectRepository(Presupuesto)
    private readonly presupuestoRepository: Repository<Presupuesto>,

    @InjectRepository(Card) // Asegúrate de que Card esté en el módulo
    private readonly cardRepository: Repository<Card>,

    @InjectRepository(User) // Asegúrate de que User esté en el módulo
    private readonly userRepository: Repository<User>,
  ) {}

  // ✅ CREATE
async create(dto: CreatePresupuestoDto, currentUser: User) {
  // 1️⃣ Verificar que la Card exista
  const card = await this.cardRepository.findOne({
    where: { id: dto.cardId },
  });
  if (!card) {
    throw new NotFoundException(`Card con ID ${dto.cardId} no encontrada`);
  }

  // 2️⃣ Obtener usuarios si se proporcionan
  let users: User[] = [];
  if (dto.userIds && dto.userIds.length > 0) {
    users = await this.userRepository.find({
      where: { id: In(dto.userIds) },
    });
  }

  // 3️⃣ Agregar automáticamente al usuario logueado
  users.push(currentUser);

  // 4️⃣ Crear la entidad Presupuesto
  const presupuesto = this.presupuestoRepository.create({
    name: dto.name,
    description: dto.description,
    presupuesto: dto.presupuesto,
    porcentajeCumplido: 0,
    card: card,
    users: users,
  });

  return this.presupuestoRepository.save(presupuesto);
}


async findAll(currentUser: User): Promise<Presupuesto[]> {
  return this.presupuestoRepository.find({
    relations: ['card', 'users', 'metas'],
    where: {
      users: { id: currentUser.id }, // solo presupuestos del usuario logueado
    },
    order: { id: 'DESC' },
  });
}

  // ✅ TRAER UN PRESUPUESTO POR ID CON RELACIONES
 async findOne(id: number, currentUser: User): Promise<Presupuesto> {
  const presupuesto = await this.presupuestoRepository.findOne({
    where: {
      id,
      users: { id: currentUser.id }, // solo si pertenece al usuario
    },
    relations: ['card', 'users', 'metas'],
  });

  if (!presupuesto) {
    throw new NotFoundException(`Presupuesto con id ${id} no encontrado para este usuario`);
  }

  return presupuesto;
}

  // ✅ UPDATE
async update(id: number, dto: UpdatePresupuestoDto, currentUser: User) {
  const presupuesto = await this.findOne(id, currentUser); // validar propiedad

  Object.assign(presupuesto, dto);

  if (dto.cardId) {
    const card = await this.cardRepository.findOne({ where: { id: dto.cardId } });
    if (!card) throw new NotFoundException(`Card con ID ${dto.cardId} no encontrada`);
    presupuesto.card = card;
  }

  if (dto.userIds) {
    presupuesto.users = await this.userRepository.find({ where: { id: In(dto.userIds) } });
  }

  return this.presupuestoRepository.save(presupuesto);
}



  // ✅ REMOVE
 async remove(id: number, currentUser: User) {
  const presupuesto = await this.findOne(id, currentUser); // validar propiedad
  return this.presupuestoRepository.remove(presupuesto);
}

}
