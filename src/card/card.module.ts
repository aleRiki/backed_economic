import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { AccountsModule } from 'src/accounts/accounts.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Card]), AccountsModule, AuthModule],
  controllers: [CardController],
  providers: [CardService],
})
export class CardModule {}
