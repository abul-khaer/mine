import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

export interface AuditEntry {
  userId?: number;
  userEmail?: string;
  action: string;
  resource: string;
  resourceId?: number;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog) private repo: Repository<AuditLog>,
  ) {}

  async log(entry: AuditEntry) {
    const log = this.repo.create({
      user_id: entry.userId,
      user_email: entry.userEmail,
      action: entry.action,
      resource: entry.resource,
      resource_id: entry.resourceId,
      details: entry.details ? JSON.stringify(entry.details) : undefined,
      ip_address: entry.ipAddress,
      user_agent: entry.userAgent,
      status: entry.status ?? 'success',
    });
    return this.repo.save(log);
  }

  async findAll(page = 1, limit = 20, filters?: { action?: string; resource?: string; userId?: number }) {
    const qb = this.repo.createQueryBuilder('log').orderBy('log.created_at', 'DESC');

    if (filters?.action) qb.andWhere('log.action = :action', { action: filters.action });
    if (filters?.resource) qb.andWhere('log.resource = :resource', { resource: filters.resource });
    if (filters?.userId) qb.andWhere('log.user_id = :userId', { userId: filters.userId });

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit, total_pages: Math.ceil(total / limit) };
  }
}
