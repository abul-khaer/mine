import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

// ═══ ISO 27001 A.12.4: Logging and Monitoring ═══
@Entity('audit_logs')
@Index(['user_id'])
@Index(['action'])
@Index(['created_at'])
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  user_id: number;

  @Column({ length: 200, nullable: true })
  user_email: string;

  @Column({ length: 50 })
  action: string; // LOGIN, LOGOUT, CREATE, UPDATE, DELETE, LOGIN_FAILED, 2FA_SETUP, PASSWORD_RESET

  @Column({ length: 100 })
  resource: string; // user, mine, employee, report, settings

  @Column({ nullable: true })
  resource_id: number;

  @Column({ type: 'text', nullable: true })
  details: string; // JSON with change details

  @Column({ length: 45, nullable: true })
  ip_address: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @Column({ length: 20, default: 'success' })
  status: string; // success, failed, blocked

  @CreateDateColumn()
  created_at: Date;
}
