import { User } from 'src/users/entities/user.entity';
import { Presupuesto } from 'src/presupuesto/entities/presupuesto.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Taskt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ type: 'varchar', length: 50, default: 'personal' })
  type: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  spentAmount: number;

  @ManyToOne(() => Presupuesto, { nullable: true, onDelete: 'SET NULL' })
  presupuesto: Presupuesto | null;

  @ManyToMany(() => User, (user) => user.tasks)
  @JoinTable()
  users: User[];
}
