import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { MineralType } from '../entities/mineral-type.entity';

export class CreateMineralTypeDto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
}

export class UpdateMineralTypeDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() is_active?: boolean;
}

@Injectable()
export class MineralTypesService {
  constructor(
    @InjectRepository(MineralType)
    private repo: Repository<MineralType>,
  ) {}

  findAll() {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  findActive() {
    return this.repo.find({ where: { is_active: true }, order: { name: 'ASC' } });
  }

  async create(dto: CreateMineralTypeDto) {
    const exists = await this.repo.findOne({ where: { name: dto.name } });
    if (exists) throw new ConflictException('Mineral type sudah ada');
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: number, dto: UpdateMineralTypeDto) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Mineral type tidak ditemukan');
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Mineral type tidak ditemukan');
    return this.repo.remove(item);
  }
}
