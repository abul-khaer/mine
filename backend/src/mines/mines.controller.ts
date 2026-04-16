import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MinesService, CreateMineDto, UpdateMineDto } from './mines.service';

@Controller('mines')
export class MinesController {
  constructor(private service: MinesService) {}

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
  create(@Body() dto: CreateMineDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMineDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
