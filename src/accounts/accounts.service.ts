import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { User } from 'src/users/entities/user.entity';
import { Bank } from 'src/bank/entities/bank.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account) private readonly accountsRepository: Repository<Account>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Bank) private readonly bankRepository: Repository<Bank>,
  ) {}

  async create(createAccountDto: CreateAccountDto, userId: number) {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found.');

    const bank = await this.bankRepository.findOneBy({ id: createAccountDto.bankId });
    if (!bank) throw new NotFoundException('Bank not found.');

    const account = this.accountsRepository.create({
      name: createAccountDto.name,
      type: createAccountDto.type,
      balance: createAccountDto.balance,
      user,
      bank,
    });

    return this.accountsRepository.save(account);
  }

  async findByUser(userId: number) {
    return this.accountsRepository.find({
      where: { user: { id: userId } },
      relations: ['bank'],
      order: { createAt: 'DESC' },
      select: ['id', 'name', 'type', 'balance', 'createAt'],
    });
  }

  async findOneForUser(id: number, userId: number) {
    const account = await this.accountsRepository.findOne({
      where: { id },
      relations: ['user', 'bank'],
    });

    if (!account) throw new NotFoundException('Account not found.');
    if (account.user.id !== userId) throw new ForbiddenException('No access to this account.');

    return account;
  }

  async updateForUser(id: number, dto: UpdateAccountDto, userId: number) {
    const account = await this.findOneForUser(id, userId);
    Object.assign(account, dto);
    return this.accountsRepository.save(account);
  }

  async removeForUser(id: number, userId: number) {
    const account = await this.findOneForUser(id, userId);
    return this.accountsRepository.softRemove(account);
  }
}
