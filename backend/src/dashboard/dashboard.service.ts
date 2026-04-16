import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mine } from '../entities/mine.entity';
import { Employee } from '../entities/employee.entity';
import { IssueReport } from '../entities/issue-report.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Mine) private mineRepo: Repository<Mine>,
    @InjectRepository(Employee) private empRepo: Repository<Employee>,
    @InjectRepository(IssueReport) private issueRepo: Repository<IssueReport>,
  ) {}

  async getStats() {
    const [total_mines, total_employees, open_issues] = await Promise.all([
      this.mineRepo.count(),
      this.empRepo.count({ where: { status: 'active' } }),
      this.issueRepo.count({ where: { status: 'open' } }),
    ]);

    const mines_summary = await this.mineRepo.createQueryBuilder('mine')
      .loadRelationCountAndMap('mine.employee_count', 'mine.employees', 'e', qb =>
        qb.andWhere('e.status = :s', { s: 'active' })
      )
      .orderBy('mine.name', 'ASC')
      .getMany();

    return {
      total_mines,
      total_employees,
      active_mines: total_mines,
      open_issues,
      mines_summary: mines_summary.map(m => ({
        id: m.id,
        name: m.name,
        mineral_type: m.mineral_type,
        location: m.location,
        employee_count: (m as any).employee_count ?? 0,
      })),
    };
  }
}
