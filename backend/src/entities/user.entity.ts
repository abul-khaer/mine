import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Mine } from './mine.entity';

export type Role =
  | 'super_admin' | 'admin_tambang' | 'finance' | 'accounting'
  | 'kepala_tambang' | 'manager_produksi' | 'staff' | 'hr'
  | 'manager_hr' | 'manager_finance' | 'procurement';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: ['super_admin','admin_tambang','finance','accounting',
           'kepala_tambang','manager_produksi','staff','hr',
           'manager_hr','manager_finance','procurement'],
    default: 'staff',
  })
  role: Role;

  @Column({ nullable: true })
  mine_id: number;

  @ManyToOne(() => Mine, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'mine_id' })
  mine: Mine;

  @Column({ type: 'text', nullable: true })
  menu_access: string;

  @Column({ nullable: true, select: false })
  totp_secret: string;

  @Column({ default: false })
  totp_enabled: boolean;

  @CreateDateColumn()
  created_at: Date;
}
