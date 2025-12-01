import { forwardRef, Module } from '@nestjs/common';
import { TasktService } from './taskt.service';
import { TasktController } from './taskt.controller';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Taskt } from './entities/taskt.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
   imports: [
    TypeOrmModule.forFeature([Taskt]),
    forwardRef(() => UsersModule),
     AuthModule 
  ],
  controllers: [TasktController],
  providers: [TasktService],
})
export class TasktModule {}
