import { Bank } from "src/bank/entities/bank.entity";
import { Card } from "src/card/entities/card.entity";
import { User } from "src/users/entities/user.entity";
import { Column, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Account {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name: string;
    @Column()
    type: string
    @Column()
    balance: number;
    @ManyToOne(() => User, (user) => user.accounts)
    user: User;
    @ManyToOne(() => Bank, (bank) => bank.accounts)
    bank: Bank;
    @OneToMany(()=> Card, (card) => card.account)
    cards: Card[];
    @DeleteDateColumn()
    deletedAt: Date;
}
