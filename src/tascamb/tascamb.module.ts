import { Module } from '@nestjs/common';
import { TasaCambioService } from './tascamb.service';
import { TasaCambioController } from './tascamb.controller'; 
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasaCambio } from './entities/tascamb.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TasaCambio])],
  controllers: [TasaCambioController],
  providers: [TasaCambioService],
})
export class TascambModule {}
