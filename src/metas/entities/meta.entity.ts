import { Presupuesto } from 'src/presupuesto/entities/presupuesto.entity';
import { Card } from 'src/card/entities/card.entity';
import { Account } from 'src/accounts/entities/account.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('metas')
export class Meta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column({ type: 'varchar', length: 10, default: 'gasto' })
  type: 'gasto' | 'ahorro';

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amount: number;

  @Column({ default: 0 })
  progreso: number;

  @Column({ default: false })
  completed: boolean;

  @ManyToOne(() => Presupuesto, (p) => p.metas, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  presupuesto: Presupuesto | null;

  @ManyToOne(() => Card, { nullable: true, onDelete: 'SET NULL' })
  card: Card | null;

  @ManyToOne(() => Account, { nullable: true, onDelete: 'SET NULL' })
  account: Account | null;

  @ManyToMany(() => User, (user) => user.metas)
  users: User[];
}
