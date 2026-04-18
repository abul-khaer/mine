import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MinesService, CreateMineDto, UpdateMineDto } from './mines.service';
import { AuditService } from '../audit/audit.service';

@Controller('mines')
export class MinesController {
  constructor(
    private service: MinesService,
    private auditService: AuditService,
  ) {}

  @Get('public')
  findPublic() {
    return this.service.findPublic();
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  findAll() {
    return this.service.findAllSimple();
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findPaginated(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search = '',
  ) {
    return this.service.findAll(+page, +limit, search);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateMineDto, @Req() req: { user: { sub: number; email: string } }) {
    const result = await this.service.create(dto);
    await this.auditService.log({
      userId: req.user.sub, userEmail: req.user.email,
      action: 'CREATE', resource: 'mine', resourceId: result.id,
      details: { name: dto.name, location: dto.location },
    });
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMineDto, @Req() req: { user: { sub: number; email: string } }) {
    const result = await this.service.update(id, dto);
    await this.auditService.log({
      userId: req.user.sub, userEmail: req.user.email,
      action: 'UPDATE', resource: 'mine', resourceId: id,
      details: { changes: Object.keys(dto) },
    });
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: { user: { sub: number; email: string } }) {
    const result = await this.service.remove(id);
    await this.auditService.log({
      userId: req.user.sub, userEmail: req.user.email,
      action: 'DELETE', resource: 'mine', resourceId: id,
    });
    return result;
  }
}
