import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskTypeService } from './task-type.service';
import { TaskTypeController } from './task-type.controller';
import { TaskType } from './entities/task-type.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([TaskType]), AuthModule],
  controllers: [TaskTypeController],
  providers: [TaskTypeService],
  exports: [TypeOrmModule],
})
export class TaskTypeModule {}
