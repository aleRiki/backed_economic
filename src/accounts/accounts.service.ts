import { Injectable, NotFoundException } from '@nestjs/common';
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
    // 1. Buscar por ID
    const bank = await this.bankRepository.findOneBy({
      id: createAccountDto.bankId, // Usar bankId
    });
    const user = await this.usersRepository.findOneBy({
      id: createAccountDto.userId, // Usar userId
    });

    // 2. Manejo de Errores (usando NotFoundException como se sugirió)
    if (!bank) {
      throw new NotFoundException(
        `Bank with ID '${createAccountDto.bankId}' not found.`,
      );
    }
    if (!user) {
      throw new NotFoundException(
        `User with ID '${createAccountDto.userId}' not found.`,
      );
    }

    
    const account = this.accountsRepository.create({
      
      name: createAccountDto.name,
      type: createAccountDto.type,
      balance: createAccountDto.balance,
    
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
