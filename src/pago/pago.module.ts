import { Module } from '@nestjs/common';
import { PagoController } from './pago.controller';
import { PaymentsService } from './pago.service';
import { ConfigModule } from '@nestjs/config';

@Module({
 imports: [ConfigModule.forRoot()],
  controllers: [PagoController],
  providers: [PaymentsService],
})
export class PagoModule {}
