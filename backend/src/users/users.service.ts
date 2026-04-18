import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsArray, IsEmail, IsEnum, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { User } from '../entities/user.entity';
import type { Role } from '../entities/user.entity';
import { AuthService } from '../auth/auth.service';

export class CreateUserDto {
  @IsString() name: string;
  @IsEmail() email: string;
  @IsEnum(['super_admin','admin_tambang','finance','accounting','kepala_tambang','manager_produksi','staff','hr','manager_hr','manager_finance','procurement'])
  role: Role;
  @IsOptional() @IsNumber() mine_id?: number;
  @IsString() @MinLength(6) password: string;
  @IsOptional() @IsArray() menu_access?: string[];
}

export class UpdateUserDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() role?: Role;
  @IsOptional() @IsNumber() mine_id?: number;
  @IsOptional() @IsString() @MinLength(6) password?: string;
  @IsOptional() @IsArray() menu_access?: string[];
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    private authService: AuthService,
  ) {}

  async findAll(page = 1, limit = 15) {
    const [data, total] = await this.repo.findAndCount({
      relations: ['mine'],
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });
    return { data, total, page, limit, total_pages: Math.ceil(total / limit) };
  }

  async create(dto: CreateUserDto) {
    const exists = await this.repo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email sudah digunakan');
    // ═══ ISO 27001 A.9.4.3: Enforce password policy ═══
    this.authService.validatePasswordStrength(dto.password);
    const hashed = await this.authService.hashPassword(dto.password);
    const menuAccess = dto.menu_access ? JSON.stringify(dto.menu_access) : undefined;
    const user = this.repo.create({ ...dto, password: hashed, menu_access: menuAccess });
    return this.repo.save(user);
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    if (dto.password) {
      this.authService.validatePasswordStrength(dto.password);
      dto.password = await this.authService.hashPassword(dto.password);
    } else {
      delete dto.password;
    }
    if (dto.menu_access !== undefined) {
      user.menu_access = JSON.stringify(dto.menu_access);
      delete dto.menu_access;
    }
    Object.assign(user, dto);
    return this.repo.save(user);
  }

  async remove(id: number) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    return this.repo.remove(user);
  }
}
