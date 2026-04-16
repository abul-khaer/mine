import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Mine } from './mine.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  mine_id: number;

  @ManyToOne(() => Mine, (m) => m.employees, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mine_id' })
  mine: Mine;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 50, unique: true })
  nik: string;

  @Column({ length: 100 })
  position: string;

  @Column({ length: 100 })
  department: string;

  @Column({ type: 'date' })
  hire_date: string;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: 'active' | 'inactive';

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
