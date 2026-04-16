import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mine } from '../entities/mine.entity';
import { Employee } from '../entities/employee.entity';
import { IssueReport } from '../entities/issue-report.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([Mine, Employee, IssueReport])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
