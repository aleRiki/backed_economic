import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Bank } from 'src/bank/entities/bank.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account) private accountsRepository: Repository<Account>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Bank) private bankRepository: Repository<Bank>,
  ) {}
  async create(createAccountDto: CreateAccountDto) {
    const bank = await this.bankRepository.findOneBy({
      name: createAccountDto.Bank,
    });
    const user = await this.usersRepository.findOneBy({
      name: createAccountDto.User,
    });

    if (!bank || !user) {
      throw new Error('Bank or User not found');
    }

    const account = this.accountsRepository.create({
      ...createAccountDto,
      bank: bank,
      user: user,
    });

    return await this.accountsRepository.save(account);
  }

  findAll() {
    return this.accountsRepository.find();
  }

  findOne(id: number) {
    return this.accountsRepository.findOneBy({ id });
  }

  update(id: number, updateAccountDto: UpdateAccountDto) {
    return this.accountsRepository.update(id, updateAccountDto);
  }

  remove(id: number) {
    return this.accountsRepository.softDelete(id);
  }
}
