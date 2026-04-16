import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { MasterDataService, CreateMasterDataDto, UpdateMasterDataDto } from './master-data.service';

@Controller('master-data')
export class MasterDataController {
  constructor(private service: MasterDataService) {}

  /** Public — active items only, requires ?category=xxx */
  @Get()
  findActive(@Query('category') category: string) {
    return this.service.findByCategory(category);
  }

  /** Admin — all items including inactive, requires ?category=xxx */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin_tambang')
  @Get('admin')
  findAll(@Query('category') category: string) {
    return this.service.findAllByCategory(category);
  }

  /** Admin — list of distinct categories with count */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin_tambang')
  @Get('categories')
  getCategories() {
    return this.service.getCategories();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin_tambang')
  @Post()
  create(@Body() dto: CreateMasterDataDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin_tambang')
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMasterDataDto,
  ) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin_tambang')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
