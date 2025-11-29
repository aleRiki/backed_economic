import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error(
        '❌ La variable STRIPE_SECRET_KEY no está definida en el archivo .env',
      );
    }

    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2025-10-29.clover',
    });
  }

  async createCheckoutSession(
    amount: number,
    currency: string,
    productName: string,
  ): Promise<{ url: string }> {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: productName },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: 'https://tu-frontend.com/success',
      cancel_url: 'https://tu-frontend.com/cancel',
    });

    if (!session.url) {
      throw new Error('Stripe no devolvió una URL de sesión válida.');
    }

    return { url: session.url };
  }
}
