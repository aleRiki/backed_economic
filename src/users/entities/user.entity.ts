import { Account } from 'src/accounts/entities/account.entity';
import { Role } from 'src/auth/enums/role.enum';
import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToMany,
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
  @Column({ nullable: false, select: false })
  password: string;
  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;
  @OneToMany(() => Account, (account) => account.owner)
  ownedAccounts?: Account[];

  @ManyToMany(() => Account, (account) => account.users)
  sharedAccounts?: Account[];
  @DeleteDateColumn()
  deletedAt: Date;
}
