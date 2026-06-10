import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskType } from './entities/task-type.entity';
import { CreateTaskTypeDto } from './dto/create-task-type.dto';
import { UpdateTaskTypeDto } from './dto/update-task-type.dto';

@Injectable()
export class TaskTypeService {
  constructor(
    @InjectRepository(TaskType)
    private readonly taskTypeRepository: Repository<TaskType>,
  ) {}

  async create(dto: CreateTaskTypeDto, userId: number) {
    const taskType = this.taskTypeRepository.create({
      name: dto.name,
      user: { id: userId } as any,
    });
    return this.taskTypeRepository.save(taskType);
  }

  async findAll(userId: number) {
    return this.taskTypeRepository.find({
      where: { user: { id: userId } },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number, userId: number) {
    const taskType = await this.taskTypeRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!taskType) {
      throw new NotFoundException(`Task type with id ${id} not found`);
    }
    return taskType;
  }

  async update(id: number, dto: UpdateTaskTypeDto, userId: number) {
    const taskType = await this.findOne(id, userId);
    Object.assign(taskType, dto);
    return this.taskTypeRepository.save(taskType);
  }

  async remove(id: number, userId: number) {
    const taskType = await this.findOne(id, userId);
    return this.taskTypeRepository.remove(taskType);
  }
}
