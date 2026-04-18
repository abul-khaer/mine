import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuditService } from './audit.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
@Controller('audit')
export class AuditController {
  constructor(private service: AuditService) {}

  @Get('logs')
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
    @Query('user_id') userId?: number,
  ) {
    return this.service.findAll(+page, +limit, { action, resource, userId: userId ? +userId : undefined });
  }
}
