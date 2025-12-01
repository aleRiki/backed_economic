import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Taskt } from './entities/taskt.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateTasktDto } from './dto/create-taskt.dto';
import { UpdateTasktDto } from './dto/update-taskt.dto';

@Injectable()
export class TasktService {
  constructor(
    @InjectRepository(Taskt)
    private taskRepository: Repository<Taskt>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(dto: CreateTasktDto, creatorId: number) {
    const { title, description, isCompleted, userIds } = dto;

    const creator = await this.userRepository.findOne({ where: { id: creatorId } });
    if (!creator) throw new NotFoundException('Creator not found');

    const usersToAssign = [creator];

    if (userIds && userIds.length > 0) {
      const extraUsers = await this.userRepository.findByIds(userIds);
      if (extraUsers.length !== userIds.length) {
        throw new NotFoundException('One or more users do not exist');
      }
      usersToAssign.push(...extraUsers);
    }

    const task = this.taskRepository.create({
      title,
      description,
      isCompleted,
      users: usersToAssign,
    });

    return await this.taskRepository.save(task);
  }

  async findAll(userId: number) {
    return this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.users', 'user')
      .where('user.id = :userId', { userId })
      .getMany();
  }

  async findOne(id: number, userId: number) {
    const task = await this.taskRepository.findOne({ where: { id }, relations: ['users'] });
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

  async markAsCompleted(id: number, userId: number) {
    const task = await this.findOne(id, userId);
    task.isCompleted = true;
    return this.taskRepository.save(task);
  }

  async remove(id: number, userId: number) {
    const task = await this.findOne(id, userId);
    return this.taskRepository.remove(task);
  }
}