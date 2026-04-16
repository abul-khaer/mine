import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleAccessService, RoleAccessItem } from './role-access.service';

@Controller('role-access')
export class RoleAccessController {
  constructor(private service: RoleAccessService) {}

  /** Any authenticated user — used on app load to get current access map */
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  /** Super admin only — replace entire access matrix */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Put()
  update(@Body() body: { items: RoleAccessItem[] }) {
    return this.service.updateBulk(body.items);
  }
}
