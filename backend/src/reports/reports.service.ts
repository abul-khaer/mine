import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductionReport } from '../entities/production-report.entity';
import { FinancialReport } from '../entities/financial-report.entity';
import { ActivityReport } from '../entities/activity-report.entity';
import { IssueReport } from '../entities/issue-report.entity';
import { Employee } from '../entities/employee.entity';

interface ReportQuery {
  page?: number;
  limit?: number;
  mine_id?: number;
  start_date?: string;
  end_date?: string;
}

function paginate<T>(qb: any, page: number, limit: number) {
  return qb.skip((page - 1) * limit).take(limit);
}

function applyFilters(qb: any, alias: string, mine_id?: number, start_date?: string, end_date?: string) {
  if (mine_id) qb.andWhere(`${alias}.mine_id = :mine_id`, { mine_id });
  if (start_date) qb.andWhere(`${alias}.date >= :start_date`, { start_date });
  if (end_date) qb.andWhere(`${alias}.date <= :end_date`, { end_date });
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ProductionReport) private prodRepo: Repository<ProductionReport>,
    @InjectRepository(FinancialReport) private finRepo: Repository<FinancialReport>,
    @InjectRepository(ActivityReport) private actRepo: Repository<ActivityReport>,
    @InjectRepository(IssueReport) private issueRepo: Repository<IssueReport>,
    @InjectRepository(Employee) private empRepo: Repository<Employee>,
  ) {}

  async getEmployees(query: ReportQuery) {
    const { page = 1, limit = 15, mine_id, start_date, end_date } = query;
    const qb = this.empRepo.createQueryBuilder('e')
      .leftJoinAndSelect('e.mine', 'mine')
      .select(['e.id', 'e.nik', 'e.name', 'e.position', 'e.department', 'e.hire_date', 'e.status', 'mine.name'])
      .orderBy('mine.name').addOrderBy('e.name');
    applyFilters(qb, 'e', mine_id);
    if (start_date) qb.andWhere('e.hire_date >= :start_date', { start_date });
    if (end_date) qb.andWhere('e.hire_date <= :end_date', { end_date });
    const total = await qb.getCount();
    if (limit < 9999) paginate(qb, page, limit);
    const raw = await qb.getMany();
    const data = raw.map(e => ({ ...e, mine_name: (e as any).mine?.name ?? '' }));
    return { data, total, page, limit, total_pages: Math.ceil(total / limit) };
  }

  async getProduction(query: ReportQuery) {
    const { page = 1, limit = 15, mine_id, start_date, end_date } = query;
    const qb = this.prodRepo.createQueryBuilder('r')
      .leftJoinAndSelect('r.mine', 'mine')
      .orderBy('r.date', 'DESC');
    applyFilters(qb, 'r', mine_id, start_date, end_date);
    const total = await qb.getCount();
    if (limit < 9999) paginate(qb, page, limit);
    const raw = await qb.getMany();
    const data = raw.map(r => ({
      ...r,
      mine_name: (r as any).mine?.name ?? '',
      achievement: r.target_volume > 0 ? ((r.actual_volume / r.target_volume) * 100).toFixed(1) : '0',
    }));
    return { data, total, page, limit, total_pages: Math.ceil(total / limit) };
  }

  async getFinancial(query: ReportQuery) {
    const { page = 1, limit = 15, mine_id, start_date, end_date } = query;
    const qb = this.finRepo.createQueryBuilder('r')
      .leftJoinAndSelect('r.mine', 'mine')
      .orderBy('r.date', 'DESC');
    applyFilters(qb, 'r', mine_id, start_date, end_date);
    const total = await qb.getCount();
    if (limit < 9999) paginate(qb, page, limit);
    const raw = await qb.getMany();
    const data = raw.map(r => ({ ...r, mine_name: (r as any).mine?.name ?? '' }));
    return { data, total, page, limit, total_pages: Math.ceil(total / limit) };
  }

  async getActivities(query: ReportQuery) {
    const { page = 1, limit = 15, mine_id, start_date, end_date } = query;
    const qb = this.actRepo.createQueryBuilder('r')
      .leftJoinAndSelect('r.mine', 'mine')
      .orderBy('r.date', 'DESC');
    applyFilters(qb, 'r', mine_id, start_date, end_date);
    const total = await qb.getCount();
    if (limit < 9999) paginate(qb, page, limit);
    const raw = await qb.getMany();
    const data = raw.map(r => ({ ...r, mine_name: (r as any).mine?.name ?? '' }));
    return { data, total, page, limit, total_pages: Math.ceil(total / limit) };
  }

  async getIssues(query: ReportQuery) {
    const { page = 1, limit = 15, mine_id, start_date, end_date } = query;
    const qb = this.issueRepo.createQueryBuilder('r')
      .leftJoinAndSelect('r.mine', 'mine')
      .orderBy('r.date', 'DESC');
    applyFilters(qb, 'r', mine_id, start_date, end_date);
    const total = await qb.getCount();
    if (limit < 9999) paginate(qb, page, limit);
    const raw = await qb.getMany();
    const data = raw.map(r => ({ ...r, mine_name: (r as any).mine?.name ?? '' }));
    return { data, total, page, limit, total_pages: Math.ceil(total / limit) };
  }
}
