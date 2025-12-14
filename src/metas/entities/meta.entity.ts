import { Presupuesto } from 'src/presupuesto/entities/presupuesto.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, ManyToMany, PrimaryGeneratedColumn, JoinTable } from 'typeorm';

@Entity('metas')
export class Meta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  // 🔹 Relación con Presupuesto
  @ManyToOne(() => Presupuesto, (p) => p.metas, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  presupuesto: Presupuesto;

  // 🔹 Relación con User (Lado propietario)
  @ManyToMany(() => User, (user) => user.metas)
  users: User[];
}
