import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Employee } from '../entities/employee.entity';

export class CreateEmployeeDto {
  @IsNumber() mine_id: number;
  @IsString() name: string;
  @IsString() nik: string;
  @IsString() position: string;
  @IsString() department: string;
  @IsString() hire_date: string;
  @IsEnum(['active', 'inactive']) status: 'active' | 'inactive';
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() email?: string;
}

export class UpdateEmployeeDto extends CreateEmployeeDto {}

@Injectable()
export class EmployeesService {
  constructor(@InjectRepository(Employee) private repo: Repository<Employee>) {}

  async findAll(page = 1, limit = 10, search = '', mine_id?: number) {
    const qb = this.repo.createQueryBuilder('e')
      .leftJoinAndSelect('e.mine', 'mine')
      .orderBy('e.name', 'ASC');
    if (search) qb.andWhere('e.name LIKE :s OR e.nik LIKE :s OR e.position LIKE :s', { s: `%${search}%` });
    if (mine_id) qb.andWhere('e.mine_id = :mine_id', { mine_id });
    const total = await qb.getCount();
    qb.skip((page - 1) * limit).take(limit);
    const data = await qb.getMany();
    return { data, total, page, limit, total_pages: Math.ceil(total / limit) };
  }

  async create(dto: CreateEmployeeDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: number, dto: UpdateEmployeeDto) {
    const emp = await this.repo.findOne({ where: { id } });
    if (!emp) throw new NotFoundException('Karyawan tidak ditemukan');
    Object.assign(emp, dto);
    return this.repo.save(emp);
  }

  async remove(id: number) {
    const emp = await this.repo.findOne({ where: { id } });
    if (!emp) throw new NotFoundException('Karyawan tidak ditemukan');
    return this.repo.remove(emp);
  }
}
