import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { MasterData } from '../entities/master-data.entity';

export class CreateMasterDataDto {
  @IsString() category: string;
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
}

export class UpdateMasterDataDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() is_active?: boolean;
}

@Injectable()
export class MasterDataService {
  constructor(
    @InjectRepository(MasterData)
    private repo: Repository<MasterData>,
  ) {}

  /** Active items only, ordered by name ASC */
  findByCategory(category: string) {
    return this.repo.find({
      where: { category, is_active: true },
      order: { name: 'ASC' },
    });
  }

  /** All items including inactive */
  findAllByCategory(category: string) {
    return this.repo.find({
      where: { category },
      order: { name: 'ASC' },
    });
  }

  /** Distinct categories with count */
  async getCategories() {
    const result = await this.repo
      .createQueryBuilder('md')
      .select('md.category', 'category')
      .addSelect('COUNT(md.id)', 'count')
      .groupBy('md.category')
      .orderBy('md.category', 'ASC')
      .getRawMany();
    return result.map((r) => ({ category: r.category, count: Number(r.count) }));
  }

  async create(dto: CreateMasterDataDto) {
    const exists = await this.repo.findOne({
      where: { category: dto.category, name: dto.name },
    });
    if (exists) throw new ConflictException('Item dengan nama dan kategori ini sudah ada');
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: number, dto: UpdateMasterDataDto) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Item tidak ditemukan');
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Item tidak ditemukan');
    return this.repo.remove(item);
  }
}
