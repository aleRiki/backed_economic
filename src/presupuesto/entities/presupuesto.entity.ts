import { Card } from "src/card/entities/card.entity";
import { User } from "src/users/entities/user.entity";
import { Meta } from "src/metas/entities/meta.entity";
import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, JoinTable } from "typeorm";

@Entity('presupuestos')
export class Presupuesto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  presupuesto: number;

  @Column({ default: 0 })
  porcentajeCumplido: number;

  // 🔹 Relación con Meta
  @OneToMany(() => Meta, (meta) => meta.presupuesto, { cascade: true })
  metas: Meta[];

  // 🔹 Relación con Card
  @ManyToOne(() => Card, (card) => card.presupuestos, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  card: Card;

  // 🔹 Relación con User (Lado propietario)
  @ManyToMany(() => User, (user) => user.presupuestos, { cascade: true })
  @JoinTable({
    name: 'user_presupuestos',
    joinColumn: { name: 'presupuesto_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users: User[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
