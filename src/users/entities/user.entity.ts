import { Account } from 'src/accounts/entities/account.entity';
import { Role } from 'src/auth/enums/role.enum';
import { Meta } from 'src/metas/entities/meta.entity';
import { Presupuesto } from 'src/presupuesto/entities/presupuesto.entity';
import { Taskt } from 'src/taskt/entities/taskt.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinTable,
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

  @ManyToMany(() => Taskt, (task) => task.users)
  tasks: Taskt[];
  @ManyToMany(() => Presupuesto, (presupuesto) => presupuesto.users)
  presupuestos: Presupuesto[];

  // LADO PROPIETARIO
  @ManyToMany(() => Meta, (meta) => meta.users, {
    cascade: true,
  })
  @JoinTable({
    name: 'user_metas',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'meta_id',
      referencedColumnName: 'id',
    },
  })
  metas: Meta[];

  @DeleteDateColumn()
  deletedAt: Date;
}
