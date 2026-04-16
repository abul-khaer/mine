import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('master_data')
@Index(['category', 'name'], { unique: true })
export class MasterData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  category: string; // 'mineral_type' | 'position' | 'department' | 'financial_category' | 'activity_category'

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;
}
