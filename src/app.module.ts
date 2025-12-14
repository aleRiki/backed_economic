import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AccountsModule } from './accounts/accounts.module';
import { BankModule } from './bank/bank.module';
import { CardModule } from './card/card.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TransactionModule } from './transaction/transaction.module';
import { TascambModule } from './tascamb/tascamb.module';

import { PagoController } from './pago/pago.controller';
import { PagoModule } from './pago/pago.module';
import { TasktModule } from './taskt/taskt.module';
import { BudgetModule } from './budget/budget.module';
import { MetasModule } from './metas/metas.module';
import { PresupuestoModule } from './presupuesto/presupuesto.module';
@Module({
  imports: [
    UsersModule,
    AccountsModule,
    BankModule,
    PagoModule,
    CardModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: true,
      synchronize: true, // solo en desarrollo
      ssl:
        process.env.POSTGRES_SSL === 'true'
          ? { rejectUnauthorized: false }
          : false,
    }),
    AuthModule,

    TransactionModule,
    TascambModule,
    TasktModule,
    BudgetModule,
    MetasModule,
    PresupuestoModule,
  ],
})
export class AppModule {}
