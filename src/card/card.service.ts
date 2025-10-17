import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './entities/card.entity';
import { Account } from 'src/accounts/entities/account.entity'; // Asumo la ruta es correcta

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card) private cardRepository: Repository<Card>,
    @InjectRepository(Account) private accountRepository: Repository<Account>,
  ) {}

async create(createCardDto: CreateCardDto) {
  const accountId = createCardDto.account;

  const account = await this.accountRepository.findOneBy({ id: accountId });

  if (!account) {
    throw new NotFoundException(`Account with ID ${accountId} not found.`);
  }

  const card = this.cardRepository.create({
    number: createCardDto.number,
    account,
    balance: Number(account.balance), // 👈 asignamos balance inicial
  });

  return await this.cardRepository.save(card);
}

  // Las funciones findAll y findOne deben devolver tarjetas, no cuentas.
  
  findAll() {
    // Retorna todas las tarjetas, con la relación 'account' cargada
    return this.cardRepository.find({ relations: ['account'] });
  }

  findOne(id: number) {
    // Retorna una tarjeta específica por ID, cargando la relación 'account'
    return this.cardRepository.findOne({ 
      where: { id },
      relations: ['account']
    });
  }

  async update(id: number, updateCardDto: UpdateCardDto) {
    const card = await this.cardRepository.findOneBy({ id });
    if (!card) {
      throw new NotFoundException(`Card with ID ${id} not found.`);
    }

    let account: Account | undefined = undefined;
    
    // Si el DTO incluye una cuenta nueva
    if (updateCardDto.account !== undefined && updateCardDto.account !== null) {
      // CORRECCIÓN CLAVE: updateCardDto.account ya es un número.
      const accountId = updateCardDto.account;
      
      const foundAccount = await this.accountRepository.findOneBy({
        id: accountId, 
      });

      if (!foundAccount) {
        throw new NotFoundException(`Account with ID ${accountId} not found.`);
      }
      account = foundAccount;
    }

    // Usar .merge() para fusionar las propiedades
    this.cardRepository.merge(card, {
      number: updateCardDto.number, // Asignar el número si está presente
      account: account, // Asignar la cuenta solo si se encontró una nueva
    });


    return await this.cardRepository.save(card);
  }

  async remove(id: number) {
    const result = await this.cardRepository.softDelete(id); // Usa softDelete por el DeleteDateColumn
    if (result.affected === 0) {
        throw new NotFoundException(`Card with ID ${id} not found.`);
    }
    return { message: `Card with ID ${id} softly removed.` };
  }
}
