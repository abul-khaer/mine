import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, Index } from 'typeorm';

@Entity('role_access')
@Index(['menu_key', 'role'], { unique: true })
export class RoleAccess {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  menu_key: string;

  @Column({ length: 50 })
  role: string;

  @Column({ default: true })
  has_access: boolean;

  @UpdateDateColumn()
  updated_at: Date;
}
