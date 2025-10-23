import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { User } from 'src/users/entities/user.entity';
import { Bank } from 'src/bank/entities/bank.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { In } from 'typeorm';
@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Bank) private readonly bankRepository: Repository<Bank>,
  ) {}
  async create(createAccountDto: CreateAccountDto, userId: number) {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found.');

    const bank = await this.bankRepository.findOneBy({
      id: createAccountDto.bankId,
    });
    if (!bank) throw new NotFoundException('Bank not found.');

    // Buscar los usuarios compartidos (solo si es cuenta familiar)
    let sharedUsers: User[] = [];

    if (
      createAccountDto.typeAccount === 'familiar' &&
      Array.isArray(createAccountDto.userIds) &&
      createAccountDto.userIds.length > 0
    ) {
      sharedUsers = await this.usersRepository.findByIds(
        createAccountDto.userIds,
      );
    }

    const account = this.accountsRepository.create({
      name: createAccountDto.name,
      type: createAccountDto.type,
      balance: createAccountDto.balance,
      typeAccount: createAccountDto.typeAccount,
      owner: user,
      bank,
      users: sharedUsers, // 👈 se agregan aquí los usuarios relacionados
    });

    return this.accountsRepository.save(account);
  }

 async findByUser(userId: number) {
  return this.accountsRepository
    .createQueryBuilder('account')
    .leftJoinAndSelect('account.bank', 'bank')
    .leftJoinAndSelect('account.owner', 'owner')
    .leftJoinAndSelect('account.users', 'users')
    .where(
      new Brackets((qb) => {
        qb.where('owner.id = :userId').orWhere('users.id = :userId');
      })
    )
    .setParameter('userId', userId)
    .orderBy('account.createAt', 'DESC')
    .getMany();
}


  async findOneForUser(id: number, userId: number) {
    const account = await this.accountsRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.bank', 'bank')
      .leftJoinAndSelect('account.owner', 'owner')
      .leftJoinAndSelect('account.users', 'users')
      .where('account.id = :id', { id })
      .andWhere('(owner.id = :userId OR users.id = :userId)', { userId })
      .getOne();

    if (!account)
      throw new NotFoundException('Account not found or access denied.');

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
