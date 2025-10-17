import { Injectable } from '@nestjs/common';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bank } from './entities/bank.entity';
import { HttpService } from '@nestjs/axios'; 
import { ConfigService } from '@nestjs/config'; 
import { firstValueFrom } from 'rxjs'; 


export type CurrencyRates = Record<string, number>; 

@Injectable()
export class BankService {
   
    private readonly currencyApiUrl: string | undefined;

    constructor(
        @InjectRepository(Bank) private bankRepository: Repository<Bank>,
        
        private readonly httpService: HttpService,
        private readonly configService: ConfigService, 
    ) {
        // 1. OBTENER LA URL COMPLETA DEL .ENV (puede ser undefined)
        this.currencyApiUrl = this.configService.get<string>('CURRENCY_API_FULL_URL');
        
        if (!this.currencyApiUrl) {
            console.warn("⚠️ Advertencia: CURRENCY_API_FULL_URL no está definida en .env. El endpoint de tasas fallará.");
        }
    }

    // --- FUNCIONES CRUD EXISTENTES ---

    create(createBankDto: CreateBankDto) {
        return this.bankRepository.save(createBankDto);
    }

    findAll() {
        return this.bankRepository.find();
    }

    findOne(id: number) {
        return this.bankRepository.findOneBy({id});
    }

    update(id: number, updateBankDto: UpdateBankDto) {
        return this.bankRepository.update(id, updateBankDto);
    }

    remove(id: number) {
        return this.bankRepository.softDelete(id);
    }

    // --- NUEVA FUNCIÓN PARA OBTENER TASAS DE CAMBIO ---

    /**
     * Consume la API externa de tasas de cambio (URL completa obtenida de .env).
     * @returns {Promise<{ rates: CurrencyRates, updated: number }>} Objeto de tasas y timestamp.
     */
    async getExchangeRates(): Promise<{ rates: CurrencyRates, updated: number }> {
        // 💥 Chequeo de seguridad: Lanzar error si la URL no se cargó
        if (!this.currencyApiUrl) {
            throw new Error("La URL de la API de tasas no está configurada. Revise su archivo .env.");
        }
        
        try {
            // Consumimos la URL completa usando HttpService.get()
            // firstValueFrom convierte el Observable en una Promise
            const response = await firstValueFrom(
                this.httpService.get(this.currencyApiUrl)
            );

            const data = response.data;
            
            if (!data.valid || !data.rates) {
                throw new Error("Respuesta de la API de tasas inválida o incompleta.");
            }

            // Devolvemos el formato que espera tu frontend
            return {
                rates: data.rates as CurrencyRates,
                updated: data.updated as number,
            };

        } catch (error) {
            console.error("Error al obtener tasas de cambio:", error instanceof Error ? error.message : 'Error desconocido');
            throw new Error("No se pudo obtener las tasas de cambio externas.");
        }
    }
}