import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import Stripe from 'stripe';
import { PaymentsService } from './pago.service';

@Controller('pago')
export class PagoController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-checkout')
  async createCheckoutSession(
    @Body() body: { amount: number; currency: string; name: string },
  ) {
    try {
      const session = await this.paymentsService.createCheckoutSession(
        body.amount,
        body.currency,
        body.name,
      );

      return { url: session.url };
    } catch (error) {
      console.error('[Stripe Error]', error);
      throw new HttpException(
        {
          message: 'Error creando la sesión de Stripe',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

