import { Card } from "src/card/entities/card.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    transactionType: string;
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number
    @CreateDateColumn()
    createAt: Date;
    @Column()
    description: string;
    @ManyToOne(()=> Card, (card) => card.id)
    card: Card;
}
