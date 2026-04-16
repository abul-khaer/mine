import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionReport } from '../entities/production-report.entity';
import { FinancialReport } from '../entities/financial-report.entity';
import { ActivityReport } from '../entities/activity-report.entity';
import { IssueReport } from '../entities/issue-report.entity';
import { Employee } from '../entities/employee.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductionReport, FinancialReport, ActivityReport, IssueReport, Employee])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
