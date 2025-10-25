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
// 🚨 Importar el enum para estandarizar los tipos de transacción
import { TransactionType } from './enum/transaction-type.enum'; 
// NOTA: Debes crear este archivo en './enums/transaction-type.enum.ts'

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

  /**
   * Crea una nueva transacción (depósito o retiro) y actualiza los balances de la tarjeta y la cuenta.
   * La lógica para el retiro ('withdraw') y el depósito ('deposit') es manejada.
   */
async create(createTransactionDto: CreateTransactionDto) {
    // 1. Desestructurar DTO
    // ✅ CORRECCIÓN: Incluir 'category' en la desestructuración
    const { transactionType, category, amount, description, cardId } = createTransactionDto;

    // 2. Buscar la tarjeta y su cuenta asociada
    const card = await this.cardRepository.findOne({
      where: { id: cardId },
      relations: ['account'],
    });

    if (!card || !card.account) {
      throw new NotFoundException(`Card or linked account not found for ID ${cardId}.`);
    }

    // 3. Preparar montos y balances
    const numericAmount = Number(amount);
    
    // MEJORA DE PRECISIÓN: Convertir a números y usar toFixed(2) al guardar.
    let newCardBalance = Number(card.balance);
    let newAccountBalance = Number(card.account.balance);

    // 4. Actualizar balances según el tipo de transacción
    if (transactionType === TransactionType.DEPOSIT) {
      newCardBalance += numericAmount;
      newAccountBalance += numericAmount;
    } else if (transactionType === TransactionType.WITHDRAW) {
      if (numericAmount > newCardBalance) {
        throw new BadRequestException('Insufficient funds on the card.');
      }
      // Lógica de retiro: resta el monto del balance de la tarjeta y la cuenta
      newCardBalance -= numericAmount;
      newAccountBalance -= numericAmount;
    } else {
      throw new BadRequestException('Invalid transaction type.');
    }

    // 5. Guardar la nueva transacción
    const transaction = this.transactionRepository.create({
      transactionType,
      // ✅ CORRECCIÓN: Incluir 'category' aquí para que se guarde el valor correcto
      category, 
      amount: numericAmount,
      description,
      card,
    });
    await this.transactionRepository.save(transaction);

    // 6. Actualizar y guardar balance de la tarjeta
    // Usamos parseFloat(toFixed(2)) para mitigar problemas de coma flotante
    card.balance = parseFloat(newCardBalance.toFixed(2));
    await this.cardRepository.save(card);

    // 7. Actualizar y guardar balance de la cuenta vinculada
    card.account.balance = parseFloat(newAccountBalance.toFixed(2));
    await this.accountRepository.save(card.account);

    return {
      message: 'Transaction processed successfully',
      transaction,
      updatedCardBalance: card.balance,
      updatedAccountBalance: card.account.balance,
    };
}
  // --------------------------------------------------------------------------------------------------
  // Métodos de Consulta
  // --------------------------------------------------------------------------------------------------

  /**
   * Busca todas las transacciones asociadas a un usuario específico a través de la relación Tarjeta -> Cuenta.
   */
  async findAllForUser(userId: number) {
    // Asumimos que la relación del usuario en Account se llama 'owner' o 'user'.
    return (
      this.transactionRepository
        .createQueryBuilder('transaction')
        .innerJoin('transaction.card', 'card')
        .innerJoin('card.account', 'account')
        .innerJoin('account.owner', 'user') // 🚨 Usamos 'owner' o 'user' según tu entidad Account
        .where('user.id = :userId', { userId })
        .leftJoinAndSelect('transaction.card', 'card_alias')
        .leftJoinAndSelect('card_alias.account', 'account_alias')
        .getMany()
    );
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

  // --------------------------------------------------------------------------------------------------
  // Métodos CRUD básicos restantes
  // --------------------------------------------------------------------------------------------------

  async update(id: number, updateTransactionDto: UpdateTransactionDto) {
    // Implementar lógica de reversión de balance y nueva aplicación aquí si fuera necesario
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