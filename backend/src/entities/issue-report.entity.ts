import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Mine } from './mine.entity';

@Entity('issue_reports')
export class IssueReport {
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
  issue_title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: ['low', 'medium', 'high', 'critical'], default: 'medium' })
  severity: 'low' | 'medium' | 'high' | 'critical';

  @Column({ type: 'enum', enum: ['open', 'in_progress', 'resolved'], default: 'open' })
  status: 'open' | 'in_progress' | 'resolved';

  @Column({ type: 'text', nullable: true })
  resolution: string;

  @Column({ nullable: true })
  created_by: number;

  @CreateDateColumn()
  created_at: Date;
}
