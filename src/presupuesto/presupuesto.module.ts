import { forwardRef, Module } from '@nestjs/common';
import { PresupuestoService } from './presupuesto.service';
import { PresupuestoController } from './presupuesto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meta } from 'src/metas/entities/meta.entity';
import { Presupuesto } from './entities/presupuesto.entity';
import { User } from 'src/users/entities/user.entity';
import { Card } from 'src/card/entities/card.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meta, Presupuesto, User, Card]),
    forwardRef(() => AuthModule),
  ],
  controllers: [PresupuestoController],
  providers: [PresupuestoService],
  exports: [TypeOrmModule, PresupuestoService],
})
export class PresupuestoModule {}
