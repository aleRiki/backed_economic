import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
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
  @Column()
  isCompleted: boolean;
  @ManyToMany(() => User, (user) => user.tasks)
  @JoinTable() // Esta tabla intermedia se crea aquí
  users: User[];
}
