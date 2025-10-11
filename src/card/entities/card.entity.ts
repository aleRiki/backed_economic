import { Account } from 'src/accounts/entities/account.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
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
}
