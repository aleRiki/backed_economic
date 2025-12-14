import { Account } from 'src/accounts/entities/account.entity';
import { Presupuesto } from 'src/presupuesto/entities/presupuesto.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Card {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  number: string;
  @ManyToOne(() => Account, (account) => account.id)
  account: Account;
  @DeleteDateColumn()
  deletedAt: Date;
   @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number; 
  @OneToMany(() => Transaction, (transaction) => transaction.card)
  transactions: Transaction[];
  @OneToMany(() => Presupuesto, (presupuesto) => presupuesto.card)
  presupuestos: Presupuesto[];
}
