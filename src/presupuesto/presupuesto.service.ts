import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Presupuesto } from './entities/presupuesto.entity';
import { Card } from 'src/card/entities/card.entity';
import { User } from 'src/users/entities/user.entity';

import { CreatePresupuestoDto } from './dto/create-presupuesto.dto';
import { UpdatePresupuestoDto } from './dto/update-presupuesto.dto';
import { TransactionService } from 'src/transaction/transaction.service';
import { TransactionType } from 'src/transaction/enum/transaction-type.enum';
import { TransactionCategory } from 'src/transaction/enum/transaction-category.enum';

@Injectable()
export class PresupuestoService {
  constructor(
    @InjectRepository(Presupuesto)
    private readonly presupuestoRepository: Repository<Presupuesto>,
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly transactionService: TransactionService,
  ) {}

  async create(dto: CreatePresupuestoDto, currentUser: User) {
    const card = await this.cardRepository.findOne({ where: { id: dto.cardId } });
    if (!card) {
      throw new NotFoundException(`Card con ID ${dto.cardId} no encontrada`);
    }

    let users: User[] = [];
    if (dto.userIds && dto.userIds.length > 0) {
      users = await this.userRepository.find({ where: { id: In(dto.userIds) } });
    }

    users.push(currentUser);

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
      where: { users: { id: currentUser.id } },
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number, currentUser: User): Promise<Presupuesto> {
    const presupuesto = await this.presupuestoRepository.findOne({
      where: { id, users: { id: currentUser.id } },
      relations: ['card', 'users', 'metas'],
    });

    if (!presupuesto) {
      throw new NotFoundException(`Presupuesto con id ${id} no encontrado para este usuario`);
    }

    return presupuesto;
  }

  async update(id: number, dto: UpdatePresupuestoDto, currentUser: User) {
    const presupuesto = await this.findOne(id, currentUser);

    const oldPorcentaje = Number(presupuesto.porcentajeCumplido);
    const newPorcentaje = dto.porcentajeCumplido !== undefined ? Number(dto.porcentajeCumplido) : oldPorcentaje;

    if (dto.cardId) {
      const card = await this.cardRepository.findOne({ where: { id: dto.cardId } });
      if (!card) throw new NotFoundException(`Card con ID ${dto.cardId} no encontrada`);
      presupuesto.card = card;
    }

    if (dto.userIds) {
      presupuesto.users = await this.userRepository.find({ where: { id: In(dto.userIds) } });
    }

    Object.assign(presupuesto, dto);

    const saved = await this.presupuestoRepository.save(presupuesto);

    if (newPorcentaje > oldPorcentaje && presupuesto.card) {
      const delta = newPorcentaje - oldPorcentaje;
      const amount = (delta / 100) * Number(presupuesto.presupuesto);

      if (amount > 0) {
        try {
          await this.transactionService.create({
            transactionType: TransactionType.WITHDRAW,
            amount,
            description: `Avance de presupuesto: ${presupuesto.name}`,
            cardId: presupuesto.card.id,
            category: TransactionCategory.OTHER_EXPENSE,
            skipBalanceCheck: true,
          });
        } catch (error) {
          throw new BadRequestException(
            `No se pudo crear la transacción para el avance del presupuesto: ${error.message}`,
          );
        }
      }
    }

    return saved;
  }

  async remove(id: number, currentUser: User) {
    const presupuesto = await this.findOne(id, currentUser);
    return this.presupuestoRepository.remove(presupuesto);
  }
}
