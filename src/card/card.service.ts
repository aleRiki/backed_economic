import { Injectable } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './entities/card.entity';
import { Account } from 'src/accounts/entities/account.entity';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card) private cardRepository: Repository<Card>,
    @InjectRepository(Account) private accountRepository: Repository<Account>,
  ) {}
  async create(createCardDto: CreateCardDto) {
    const account = await this.accountRepository.findOneBy({
      name: createCardDto.account,
    });

    if (!account) {
      throw new Error('Account not found');
    }

    const card = this.cardRepository.create({
      ...createCardDto,
      account,
    });

    return await this.cardRepository.save(card);
  }

  findAll() {
    return this.accountRepository.find();
  }

  findOne(id: number) {
    return this.accountRepository.findOneBy({ id });
  }

 async update(id: number, updateCardDto: UpdateCardDto) {
  // Buscar la tarjeta por ID
  const card = await this.cardRepository.findOneBy({ id });
  if (!card) {
    throw new Error('Card not found');
  }

  // Inicializar la cuenta con la actual
  let account = card.account;

  // Si el DTO incluye una cuenta nueva, buscarla
  if (updateCardDto.account) {
    const foundAccount = await this.accountRepository.findOneBy({
      name: updateCardDto.account,
    });

    if (!foundAccount) {
      throw new Error('Account not found');
    }

    account = foundAccount;
  }

  // Crear una instancia actualizada de la tarjeta
  const updatedCard = this.cardRepository.create({
    ...card,
    ...updateCardDto,
    account,
  });

  // Guardar los cambios
  return await this.cardRepository.save(updatedCard);
}

  remove(id: number) {
    return `This action removes a #${id} card`;
  }
}
