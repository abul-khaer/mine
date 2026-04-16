import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { MineralTypesService, CreateMineralTypeDto, UpdateMineralTypeDto } from './mineral-types.service';

@Controller('mineral-types')
export class MineralTypesController {
  constructor(private service: MineralTypesService) {}

  /** Public — dipakai dropdown di MineForm */
  @Get()
  findAll() {
    return this.service.findActive();
  }

  /** Admin — semua data termasuk non-aktif */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin_tambang')
  @Get('all')
  findAllAdmin() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin_tambang')
  @Post()
  create(@Body() dto: CreateMineralTypeDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin_tambang')
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMineralTypeDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin_tambang')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
