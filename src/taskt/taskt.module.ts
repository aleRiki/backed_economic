import { forwardRef, Module } from '@nestjs/common';
import { TasktService } from './taskt.service';
import { TasktController } from './taskt.controller';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Taskt } from './entities/taskt.entity';
import { User } from 'src/users/entities/user.entity';
import { Presupuesto } from 'src/presupuesto/entities/presupuesto.entity';
import { Card } from 'src/card/entities/card.entity';
import { AuthModule } from 'src/auth/auth.module';
import { TransactionModule } from 'src/transaction/transaction.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Taskt, User, Presupuesto, Card]),
    forwardRef(() => UsersModule),
    AuthModule,
    TransactionModule,
  ],
  controllers: [TasktController],
  providers: [TasktService],
  exports: [TypeOrmModule],
})
export class TasktModule {}
