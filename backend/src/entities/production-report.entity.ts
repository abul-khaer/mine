import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Mine } from './mine.entity';

@Entity('production_reports')
export class ProductionReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  mine_id: number;

  @ManyToOne(() => Mine, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mine_id' })
  mine: Mine;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  target_volume: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  actual_volume: number;

  @Column({ length: 50, default: 'Ton' })
  unit: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  created_by: number;

  @CreateDateColumn()
  created_at: Date;
}
