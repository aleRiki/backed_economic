import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Taskt } from './entities/taskt.entity';
import { User } from 'src/users/entities/user.entity';
import { Presupuesto } from 'src/presupuesto/entities/presupuesto.entity';
import { Card } from 'src/card/entities/card.entity';
import { CreateTasktDto } from './dto/create-taskt.dto';
import { UpdateTasktDto } from './dto/update-taskt.dto';
import { TransactionService } from 'src/transaction/transaction.service';
import { TransactionType } from 'src/transaction/enum/transaction-type.enum';
import { TransactionCategory } from 'src/transaction/enum/transaction-category.enum';

@Injectable()
export class TasktService {
  constructor(
    @InjectRepository(Taskt)
    private taskRepository: Repository<Taskt>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Presupuesto)
    private presupuestoRepository: Repository<Presupuesto>,
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    private transactionService: TransactionService,
  ) {}

  async create(dto: CreateTasktDto, creatorId: number) {
    const creator = await this.userRepository.findOne({ where: { id: creatorId } });
    if (!creator) throw new NotFoundException('Creator not found');

    const presupuesto = await this.presupuestoRepository.findOne({
      where: { id: dto.presupuestoId },
      relations: ['card'],
    });
    if (!presupuesto) throw new NotFoundException('Presupuesto not found');

    const usersToAssign = [creator];
    if (dto.userIds && dto.userIds.length > 0) {
      const extraUsers = await this.userRepository.findByIds(dto.userIds);
      if (extraUsers.length !== dto.userIds.length) {
        throw new NotFoundException('One or more users do not exist');
      }
      usersToAssign.push(...extraUsers);
    }

    const task = this.taskRepository.create({
      title: dto.title,
      description: dto.description || '',
      isCompleted: dto.isCompleted || false,
      type: dto.type,
      presupuesto,
      users: usersToAssign,
    });

    return await this.taskRepository.save(task);
  }

  async findAll(userId: number) {
    return this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.users', 'user')
      .leftJoinAndSelect('task.presupuesto', 'presupuesto')
      .where('user.id = :userId', { userId })
      .getMany();
  }

  async findOne(id: number, userId: number) {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['users', 'presupuesto', 'presupuesto.card'],
    });
    if (!task) throw new NotFoundException(`Task ${id} not found`);

    const isAllowed = task.users.some((u) => u.id === userId);
    if (!isAllowed) throw new ForbiddenException('Not your task');

    return task;
  }

  async update(id: number, updateTasktDto: UpdateTasktDto, userId: number) {
    const task = await this.findOne(id, userId);
    Object.assign(task, updateTasktDto);
    return await this.taskRepository.save(task);
  }

  async markAsCompleted(id: number, userId: number, amount?: number) {
    console.log('📥 markAsCompleted llamado:', { id, userId, amount });

    const task = await this.findOne(id, userId);
    console.log('📦 Tarea encontrada:', {
      id: task.id,
      title: task.title,
      isCompleted: task.isCompleted,
      presupuestoId: task.presupuesto?.id,
      presupuestoNombre: task.presupuesto?.name,
      presupuestoTotal: task.presupuesto?.presupuesto,
      porcentajeCumplido: task.presupuesto?.porcentajeCumplido,
      cardId: task.presupuesto?.card?.id,
    });

    if (task.isCompleted) {
      throw new BadRequestException('Task is already completed');
    }

    if (!task.presupuesto) {
      throw new BadRequestException('This task has no associated budget');
    }

    const spentAmount = amount !== undefined ? amount : Number(task.spentAmount);
    console.log('💰 spentAmount calculado:', { spentAmount, amountReceived: amount, taskSpentAmount: task.spentAmount });
    if (spentAmount <= 0) {
      throw new BadRequestException('Must provide a valid spent amount');
    }

    const card = task.presupuesto.card;
    if (!card) {
      throw new BadRequestException('The budget associated with this task has no card');
    }

    const budgetTotal = Number(task.presupuesto.presupuesto) || 0;
    const porcentaje = Number(task.presupuesto.porcentajeCumplido) || 0;
    const usedAmount = (porcentaje / 100) * budgetTotal;
    const remaining = budgetTotal - usedAmount;
    console.log('📊 Chequeo de fondos:', {
      budgetTotal,
      porcentaje,
      usedAmount,
      remaining,
      spentAmount,
      sufice: spentAmount <= remaining,
    });
    if (spentAmount > remaining) {
      console.log('❌ Fondos insuficientes');
      throw new BadRequestException('Fondos insuficientes en el presupuesto para completar la tarea');
    }

    await this.transactionService.create({
      transactionType: TransactionType.WITHDRAW,
      amount: spentAmount,
      description: `Tarea completada: ${task.title}`,
      cardId: card.id,
      category: TransactionCategory.OTHER_EXPENSE,
      skipBalanceCheck: true,
    });

    const newUsed = usedAmount + spentAmount;
    task.presupuesto.porcentajeCumplido = budgetTotal > 0 ? (newUsed / budgetTotal) * 100 : 0;
    await this.presupuestoRepository.save(task.presupuesto);

    task.isCompleted = true;
    task.spentAmount = spentAmount;
    return this.taskRepository.save(task);
  }

  async remove(id: number, userId: number) {
    const task = await this.findOne(id, userId);
    return this.taskRepository.remove(task);
  }
}
