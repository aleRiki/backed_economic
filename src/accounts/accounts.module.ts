import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { UsersModule } from 'src/users/users.module';
import { BankModule } from 'src/bank/bank.module';

@Module({
  imports: [TypeOrmModule.forFeature([Account]), UsersModule, BankModule],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [TypeOrmModule]
})
export class AccountsModule {}
