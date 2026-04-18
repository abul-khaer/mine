import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UsersService, CreateUserDto, UpdateUserDto } from './users.service';
import { AuditService } from '../audit/audit.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
@Controller('users')
export class UsersController {
  constructor(
    private service: UsersService,
    private auditService: AuditService,
  ) {}

  @Get()
  findAll(@Query('page') page = 1, @Query('limit') limit = 15) {
    return this.service.findAll(+page, +limit);
  }

  @Post()
  async create(@Body() dto: CreateUserDto, @Req() req: { user: { sub: number; email: string } }) {
    const result = await this.service.create(dto);
    await this.auditService.log({
      userId: req.user.sub, userEmail: req.user.email,
      action: 'CREATE', resource: 'user', resourceId: result.id,
      details: { name: dto.name, email: dto.email, role: dto.role },
    });
    return result;
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto, @Req() req: { user: { sub: number; email: string } }) {
    const result = await this.service.update(id, dto);
    await this.auditService.log({
      userId: req.user.sub, userEmail: req.user.email,
      action: 'UPDATE', resource: 'user', resourceId: id,
      details: { changes: Object.keys(dto) },
    });
    return result;
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: { user: { sub: number; email: string } }) {
    const result = await this.service.remove(id);
    await this.auditService.log({
      userId: req.user.sub, userEmail: req.user.email,
      action: 'DELETE', resource: 'user', resourceId: id,
    });
    return result;
  }
}
