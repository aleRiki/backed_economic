import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './entities/card.entity';
import { Account } from 'src/accounts/entities/account.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card) private readonly cardRepository: Repository<Card>,
    @InjectRepository(Account) private readonly accountRepository: Repository<Account>,
  ) {}

  async createForUser(dto: CreateCardDto, userId: number) {
    const account = await this.accountRepository.findOne({
      where: { id: dto.account, user: { id: userId } },
      relations: ['user'],
    });

    if (!account) throw new ForbiddenException('Account does not belong to this user.');

    const card = this.cardRepository.create({
      number: dto.number,
      account,
      balance: Number(account.balance),
    });

    return this.cardRepository.save(card);
  }

  async findAllByUser(userId: number) {
    return this.cardRepository
      .createQueryBuilder('card')
      .leftJoinAndSelect('card.account', 'account')
      .leftJoin('account.user', 'user')
      .where('user.id = :userId', { userId })
      .select(['card.id', 'card.number', 'card.balance', 'account.id', 'account.name'])
      .orderBy('card.id', 'DESC')
      .getMany();
  }

  async findOneForUser(id: number, userId: number) {
    const card = await this.cardRepository.findOne({
      where: { id },
      relations: ['account', 'account.user'],
    });

    if (!card) throw new NotFoundException('Card not found.');
    if (card.account.user.id !== userId) throw new ForbiddenException('No access to this card.');

    return card;
  }

  async updateForUser(id: number, dto: UpdateCardDto, userId: number) {
    const card = await this.findOneForUser(id, userId);
    Object.assign(card, dto);
    return this.cardRepository.save(card);
  }

  async removeForUser(id: number, userId: number) {
    const card = await this.findOneForUser(id, userId);
    return this.cardRepository.softRemove(card);
  }
}
