import { forwardRef, Module } from '@nestjs/common';
import { MetasService } from './metas.service';
import { MetasController } from './metas.controller';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meta } from './entities/meta.entity';
import { Presupuesto } from 'src/presupuesto/entities/presupuesto.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meta, Presupuesto]),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [MetasController],
  providers: [MetasService],
  exports: [TypeOrmModule, MetasService],
})
export class MetasModule {}
