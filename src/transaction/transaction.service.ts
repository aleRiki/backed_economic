import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { Card } from 'src/card/entities/card.entity';
import { Account } from 'src/accounts/entities/account.entity'; 
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const { transactionType, amount, description, cardId } = createTransactionDto;

    // 🔍 Buscar la tarjeta con su cuenta asociada
    const card = await this.cardRepository.findOne({
      where: { id: cardId },
      relations: ['account'],
    });

    if (!card) {
      throw new NotFoundException(`Card with ID ${cardId} not found.`);
    }

    if (!card.account) {
      throw new NotFoundException(`Card ${cardId} has no linked account.`);
    }

    // 🔢 Convertir monto a número
    const numericAmount = Number(amount);
    let newCardBalance = Number(card.balance);
    let newAccountBalance = Number(card.account.balance);

    // 💸 Actualizar balances según el tipo de transacción
    if (transactionType === 'deposit') {
      newCardBalance += numericAmount;
      newAccountBalance += numericAmount;
    } else if (transactionType === 'withdraw') {
      if (numericAmount > newCardBalance) {
        throw new BadRequestException('Insufficient funds on the card.');
      }
      newCardBalance -= numericAmount;
      newAccountBalance -= numericAmount;
    } else {
      throw new BadRequestException('Invalid transaction type.');
    }

    // 🧾 Guardar la transacción
    const transaction = this.transactionRepository.create({
      transactionType,
      amount: numericAmount,
      description,
      card,
    });

    await this.transactionRepository.save(transaction);

    // 💳 Actualizar balance de la tarjeta
    card.balance = newCardBalance;
    await this.cardRepository.save(card);

    // 🏦 Actualizar balance de la cuenta vinculada
    card.account.balance = newAccountBalance;
    await this.accountRepository.save(card.account);

    return {
      message: 'Transaction processed successfully',
      transaction,
      updatedCardBalance: card.balance,
      updatedAccountBalance: card.account.balance,
    };
  }
  async findAllForUser(userId: number) {
        return this.transactionRepository.createQueryBuilder('transaction')
           
            .innerJoin('transaction.card', 'card') 
           
            .innerJoin('card.account', 'account') 
            
            .where('account.user.id = :userId', { userId }) 
            
            
            .leftJoinAndSelect('transaction.card', 'card_alias')
            .leftJoinAndSelect('card_alias.account', 'account_alias')
            .getMany();
    }
  async findAll() {
    return this.transactionRepository.find({
      relations: ['card', 'card.account'],
    });
  }

  async findOne(id: number) {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['card', 'card.account'],
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found.`);
    }
    return transaction;
  }

  async update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates transaction #${id}`;
  }

  async remove(id: number) {
    const result = await this.transactionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Transaction with ID ${id} not found.`);
    }
    return { message: `Transaction with ID ${id} deleted.` };
  }
}
