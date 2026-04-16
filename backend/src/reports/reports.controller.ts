import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get('employees')
  getEmployees(@Query() query: any) {
    return this.service.getEmployees(query);
  }

  @Get('production')
  getProduction(@Query() query: any) {
    return this.service.getProduction(query);
  }

  @Get('financial')
  getFinancial(@Query() query: any) {
    return this.service.getFinancial(query);
  }

  @Get('activities')
  getActivities(@Query() query: any) {
    return this.service.getActivities(query);
  }

  @Get('issues')
  getIssues(@Query() query: any) {
    return this.service.getIssues(query);
  }
}
