import { Account } from 'src/accounts/entities/account.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  email: string;
  @Column()
  password: string;
  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[];
  @DeleteDateColumn()
  deletedAt: Date;
}
