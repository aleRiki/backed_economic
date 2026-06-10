import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Meta } from './entities/meta.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateMetaDto } from './dto/create-meta.dto';
import { UpdateMetaDto } from './dto/update-meta.dto';
import { Presupuesto } from 'src/presupuesto/entities/presupuesto.entity';
import { Card } from 'src/card/entities/card.entity';
import { Account } from 'src/accounts/entities/account.entity';
import { TransactionService } from 'src/transaction/transaction.service';
import { TransactionType } from 'src/transaction/enum/transaction-type.enum';
import { TransactionCategory } from 'src/transaction/enum/transaction-category.enum';

@Injectable()
export class MetasService {
  constructor(
    @InjectRepository(Meta)
    private readonly metaRepository: Repository<Meta>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Presupuesto)
    private readonly presupuestoRepository: Repository<Presupuesto>,
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly transactionService: TransactionService,
  ) {}

  async create(dto: CreateMetaDto, userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    let presupuesto: Presupuesto | null = null;
    let card: Card | null = null;
    let account: Account | null = null;

    if (dto.type === 'gasto') {
      if (!dto.presupuestoId) {
        throw new BadRequestException('presupuestoId es requerido para metas de gasto');
      }
      presupuesto = await this.presupuestoRepository.findOne({ where: { id: dto.presupuestoId } });
      if (!presupuesto) throw new NotFoundException('Presupuesto no encontrado');
    } else if (dto.type === 'ahorro') {
      if (dto.cardId) {
        card = await this.cardRepository.findOne({ where: { id: dto.cardId }, relations: ['account'] });
        if (!card) throw new NotFoundException('Tarjeta no encontrada');
      }
      if (dto.accountId) {
        account = await this.accountRepository.findOne({ where: { id: dto.accountId } });
        if (!account) throw new NotFoundException('Cuenta no encontrada');
      }
      if (!card && !account) {
        throw new BadRequestException('cardId o accountId es requerido para metas de ahorro');
      }
    }

    const users = dto.userIds && dto.userIds.length > 0
      ? await this.userRepository.find({ where: { id: In(dto.userIds) } })
      : [];

    const meta = this.metaRepository.create();
    meta.name = dto.name;
    meta.description = dto.description ?? null;
    meta.type = dto.type;
    meta.amount = dto.amount;
    meta.presupuesto = presupuesto;
    meta.card = card;
    meta.account = account;
    meta.users = [user, ...users];

    return this.metaRepository.save(meta);
  }

  async findAll(currentUser: User) {
    return this.metaRepository.find({
      relations: ['users', 'presupuesto', 'card', 'account'],
      where: { users: { id: currentUser.id } },
    });
  }

  async findOne(id: number, currentUser: User) {
    const meta = await this.metaRepository.findOne({
      where: { id, users: { id: currentUser.id } },
      relations: ['users', 'presupuesto', 'presupuesto.card', 'card', 'account'],
    });
    if (!meta) throw new NotFoundException(`Meta con id ${id} no encontrada para este usuario`);
    return meta;
  }

  async update(id: number, dto: UpdateMetaDto, currentUser: User) {
    const meta = await this.findOne(id, currentUser);

    if (dto.type && dto.type !== meta.type) {
      if (dto.type === 'gasto' && !dto.presupuestoId && !meta.presupuesto) {
        throw new BadRequestException('presupuestoId es requerido para metas de gasto');
      }
      if (dto.type === 'ahorro' && !dto.cardId && !meta.card && !dto.accountId && !meta.account) {
        throw new BadRequestException('cardId o accountId es requerido para metas de ahorro');
      }
    }

    if (dto.presupuestoId) {
      const presupuesto = await this.presupuestoRepository.findOne({ where: { id: dto.presupuestoId } });
      if (!presupuesto) throw new NotFoundException('Presupuesto no encontrado');
      meta.presupuesto = presupuesto;
    }

    if (dto.cardId) {
      const card = await this.cardRepository.findOne({ where: { id: dto.cardId }, relations: ['account'] });
      if (!card) throw new NotFoundException('Tarjeta no encontrada');
      meta.card = card;
    }

    if (dto.accountId) {
      const account = await this.accountRepository.findOne({ where: { id: dto.accountId } });
      if (!account) throw new NotFoundException('Cuenta no encontrada');
      meta.account = account;
    }

    if (dto.completed === true && !meta.completed) {
      await this.executeCompletion(meta);
    }

    if (dto.progreso !== undefined && !dto.completed) {
      if (meta.type === 'gasto' && meta.presupuesto) {
        const oldPorcentaje = Number(meta.presupuesto.porcentajeCumplido) || 0;
        const newPorcentaje = dto.progreso;

        meta.presupuesto.porcentajeCumplido = newPorcentaje;
        await this.presupuestoRepository.save(meta.presupuesto);

        if (newPorcentaje > oldPorcentaje && meta.presupuesto.card) {
          const delta = newPorcentaje - oldPorcentaje;
          const amount = (delta / 100) * (Number(meta.presupuesto.presupuesto) || 0);

          if (amount > 0) {
            await this.transactionService.create({
              transactionType: TransactionType.WITHDRAW,
              amount,
              description: `Progreso de meta: ${meta.name}`,
              cardId: meta.presupuesto.card.id,
              category: TransactionCategory.OTHER_EXPENSE,
              skipBalanceCheck: true,
            });
          }
        }
      } else if (meta.type === 'ahorro') {
        const oldProgreso = Number(meta.progreso) || 0;
        const newProgreso = dto.progreso;

        if (newProgreso > oldProgreso) {
          const delta = newProgreso - oldProgreso;
          const amount = (delta / 100) * (Number(meta.amount) || 0);

          if (amount > 0) {
            const targetCard = meta.card;
            const targetAccount = meta.account;

            if (targetCard) {
              await this.transactionService.create({
                transactionType: TransactionType.DEPOSIT,
                amount,
                description: `Progreso de meta: ${meta.name}`,
                cardId: targetCard.id,
                category: TransactionCategory.OTHER_INCOME,
              });
            } else if (targetAccount) {
              const accountCards = await this.cardRepository.find({
                where: { account: { id: targetAccount.id } },
              });
              if (accountCards.length === 0) {
                throw new BadRequestException('La cuenta no tiene tarjetas asociadas para depositar el progreso');
              }
              await this.transactionService.create({
                transactionType: TransactionType.DEPOSIT,
                amount,
                description: `Progreso de meta: ${meta.name}`,
                cardId: accountCards[0].id,
                category: TransactionCategory.OTHER_INCOME,
              });
            }
          }
        }
      }
    }

    Object.assign(meta, dto);

    if (dto.userIds) {
      meta.users = await this.userRepository.find({ where: { id: In(dto.userIds) } });
    }

    return this.metaRepository.save(meta);
  }

  private async executeCompletion(meta: Meta) {
    if (meta.type === 'gasto' && meta.presupuesto) {
      const card = meta.presupuesto.card;
      if (!card) throw new BadRequestException('El presupuesto no tiene una tarjeta asociada');

      const budgetTotal = Number(meta.presupuesto.presupuesto) || 0;
      const porcentaje = Number(meta.presupuesto.porcentajeCumplido) || 0;
      const usedAmount = (porcentaje / 100) * budgetTotal;
      const remaining = budgetTotal - usedAmount;
      if (Number(meta.amount) > remaining) {
        throw new BadRequestException('Fondos insuficientes en el presupuesto para completar la meta');
      }

      await this.transactionService.create({
        transactionType: TransactionType.WITHDRAW,
        amount: Number(meta.amount),
        description: `Meta completada: ${meta.name}`,
        cardId: card.id,
        category: TransactionCategory.OTHER_EXPENSE,
        skipBalanceCheck: true,
      });

      const newUsed = usedAmount + Number(meta.amount);
      meta.presupuesto.porcentajeCumplido = budgetTotal > 0 ? (newUsed / budgetTotal) * 100 : 0;
      await this.presupuestoRepository.save(meta.presupuesto);
    } else if (meta.type === 'ahorro') {
      const targetCard = meta.card;
      const targetAccount = meta.account;

      if (!targetCard && !targetAccount) {
        throw new BadRequestException('La meta de ahorro no tiene tarjeta o cuenta asociada');
      }

      const currentProgreso = Number(meta.progreso) || 0;
      const remainingPct = Math.max(0, 100 - currentProgreso);
      const remainingAmount = (remainingPct / 100) * (Number(meta.amount) || 0);

      if (remainingAmount <= 0) return;

      if (targetCard) {
        await this.transactionService.create({
          transactionType: TransactionType.DEPOSIT,
          amount: remainingAmount,
          description: `Meta de ahorro completada: ${meta.name}`,
          cardId: targetCard.id,
          category: TransactionCategory.OTHER_INCOME,
        });
      } else if (targetAccount) {
        const accountCards = await this.cardRepository.find({
          where: { account: { id: targetAccount.id } },
        });
        if (accountCards.length === 0) {
          throw new BadRequestException('La cuenta no tiene tarjetas asociadas para depositar');
        }
        await this.transactionService.create({
          transactionType: TransactionType.DEPOSIT,
          amount: remainingAmount,
          description: `Meta de ahorro completada: ${meta.name}`,
          cardId: accountCards[0].id,
          category: TransactionCategory.OTHER_INCOME,
        });
      }
    }
  }

  async remove(id: number, currentUser: User) {
    const meta = await this.findOne(id, currentUser);
    return this.metaRepository.remove(meta);
  }
}
