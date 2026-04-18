import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { EmployeesService, CreateEmployeeDto, UpdateEmployeeDto } from './employees.service';
import { AuditService } from '../audit/audit.service';

@UseGuards(JwtAuthGuard)
@Controller('employees')
export class EmployeesController {
  constructor(
    private service: EmployeesService,
    private auditService: AuditService,
  ) {}

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search = '',
    @Query('mine_id') mine_id?: number,
  ) {
    return this.service.findAll(+page, +limit, search, mine_id ? +mine_id : undefined);
  }

  @Post()
  async create(@Body() dto: CreateEmployeeDto, @Req() req: { user: { sub: number; email: string } }) {
    const result = await this.service.create(dto);
    await this.auditService.log({
      userId: req.user.sub, userEmail: req.user.email,
      action: 'CREATE', resource: 'employee', resourceId: result.id,
      details: { name: dto.name, nik: dto.nik },
    });
    return result;
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEmployeeDto, @Req() req: { user: { sub: number; email: string } }) {
    const result = await this.service.update(id, dto);
    await this.auditService.log({
      userId: req.user.sub, userEmail: req.user.email,
      action: 'UPDATE', resource: 'employee', resourceId: id,
      details: { changes: Object.keys(dto) },
    });
    return result;
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: { user: { sub: number; email: string } }) {
    const result = await this.service.remove(id);
    await this.auditService.log({
      userId: req.user.sub, userEmail: req.user.email,
      action: 'DELETE', resource: 'employee', resourceId: id,
    });
    return result;
  }
}
