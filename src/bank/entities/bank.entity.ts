import { Delete } from '@nestjs/common';
import { Account } from 'src/accounts/entities/account.entity';
import { Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Bank {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  address: string;
  @OneToMany(()=> Account, (account) => account.bank)
  accounts: Account[];
  @DeleteDateColumn()
  deletedAt: Date;
}
