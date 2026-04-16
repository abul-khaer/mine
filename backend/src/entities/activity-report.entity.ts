import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Mine } from './mine.entity';

@Entity('activity_reports')
export class ActivityReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  mine_id: number;

  @ManyToOne(() => Mine, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mine_id' })
  mine: Mine;

  @Column({ type: 'date' })
  date: string;

  @Column({ length: 200 })
  activity: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 200 })
  pic: string;

  @Column({ type: 'enum', enum: ['planned', 'ongoing', 'completed'], default: 'planned' })
  status: 'planned' | 'ongoing' | 'completed';

  @Column({ nullable: true })
  created_by: number;

  @CreateDateColumn()
  created_at: Date;
}
