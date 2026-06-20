import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'board_id' })
  boardId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column()
  action: string;

  @Column({ name: 'entity_type' })
  entityType: string;

  @Column({ name: 'entity_id', type: 'int' })
  entityId: number;

  @Column({ nullable: true, type: 'text' })
  metadata: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
