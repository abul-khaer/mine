import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Mine } from './mine.entity';

@Entity('financial_reports')
export class FinancialReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  mine_id: number;

  @ManyToOne(() => Mine, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mine_id' })
  mine: Mine;

  @Column({ type: 'date' })
  date: string;

  @Column({ length: 100 })
  category: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  income: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  expense: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  profit: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  created_by: number;

  @CreateDateColumn()
  created_at: Date;
}
