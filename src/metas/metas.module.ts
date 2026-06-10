import { forwardRef, Module } from '@nestjs/common';
import { MetasService } from './metas.service';
import { MetasController } from './metas.controller';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meta } from './entities/meta.entity';
import { Presupuesto } from 'src/presupuesto/entities/presupuesto.entity';
import { Card } from 'src/card/entities/card.entity';
import { Account } from 'src/accounts/entities/account.entity';
import { User } from 'src/users/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { TransactionModule } from 'src/transaction/transaction.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meta, Presupuesto, User, Card, Account]),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
    TransactionModule,
  ],
  controllers: [MetasController],
  providers: [MetasService],
  exports: [TypeOrmModule, MetasService],
})
export class MetasModule {}
