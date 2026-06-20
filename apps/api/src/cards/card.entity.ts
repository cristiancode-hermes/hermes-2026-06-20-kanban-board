import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ColumnEntity } from '../columns/column.entity';
import { Board } from '../boards/board.entity';
import { User } from '../users/user.entity';

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ type: 'int', default: 0 })
  position: number;

  @Column({ name: 'due_date', nullable: true, type: 'date' })
  dueDate: Date | null;

  @Column({ nullable: true, type: 'text' })
  labels: string | null;

  @Column({ name: 'column_id' })
  columnId: number;

  @ManyToOne(() => ColumnEntity, (column) => column.cards)
  @JoinColumn({ name: 'column_id' })
  column: ColumnEntity;

  @Column({ name: 'board_id' })
  boardId: number;

  @ManyToOne(() => Board)
  @JoinColumn({ name: 'board_id' })
  board: Board;

  @Column({ name: 'assignee_id', nullable: true })
  assigneeId: number | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assignee_id' })
  assignee: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
