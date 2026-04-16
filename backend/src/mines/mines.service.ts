import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Mine } from '../entities/mine.entity';

export class CreateMineDto {
  @IsString() name: string;
  @IsString() location: string;
  @IsString() address: string;
  @IsNumber() area: number;
  @IsString() mineral_type: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsNumber() latitude?: number;
  @IsOptional() @IsNumber() longitude?: number;
}

export class UpdateMineDto extends CreateMineDto {}

@Injectable()
export class MinesService {
  constructor(@InjectRepository(Mine) private repo: Repository<Mine>) {}

  async findAll(page = 1, limit = 10, search = '') {
    const qb = this.repo.createQueryBuilder('mine')
      .loadRelationCountAndMap('mine.employee_count', 'mine.employees')
      .orderBy('mine.name', 'ASC');
    if (search) qb.where('mine.name LIKE :s OR mine.location LIKE :s', { s: `%${search}%` });
    const total = await qb.getCount();
    qb.skip((page - 1) * limit).take(limit);
    const data = await qb.getMany();
    return { data, total, page, limit, total_pages: Math.ceil(total / limit) };
  }

  async findAllSimple() {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findPublic() {
    return this.repo.createQueryBuilder('mine')
      .loadRelationCountAndMap('mine.employee_count', 'mine.employees')
      .orderBy('mine.name', 'ASC')
      .getMany();
  }

  async create(dto: CreateMineDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: number, dto: UpdateMineDto) {
    const mine = await this.repo.findOne({ where: { id } });
    if (!mine) throw new NotFoundException('Tambang tidak ditemukan');
    Object.assign(mine, dto);
    return this.repo.save(mine);
  }

  async remove(id: number) {
    const mine = await this.repo.findOne({ where: { id } });
    if (!mine) throw new NotFoundException('Tambang tidak ditemukan');
    return this.repo.remove(mine);
  }
}
