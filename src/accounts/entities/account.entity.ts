import { Bank } from 'src/bank/entities/bank.entity';
import { Card } from 'src/card/entities/card.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  type: string;
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balance: number;
  // Tipo de cuenta: personal o familiar
  @Column({ type: 'enum', enum: ['personal', 'familiar'], default: 'personal' })
  typeAccount: 'personal' | 'familiar';

  // Relación con usuario (personal: ManyToOne, familiar: ManyToMany)
  @ManyToOne(() => User, (user) => user.ownedAccounts, { nullable: true })
  owner?: User;

  @ManyToMany(() => User, (user) => user.sharedAccounts, { nullable: true })
  @JoinTable()
  users?: User[];
  @ManyToOne(() => Bank, (bank) => bank.accounts)
  bank: Bank;
  @OneToMany(() => Card, (card) => card.account)
  cards: Card[];
  @CreateDateColumn()
  createAt: Date;
  @DeleteDateColumn()
  deletedAt: Date;
}
