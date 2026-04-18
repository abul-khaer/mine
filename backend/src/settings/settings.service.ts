import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsOptional, IsString } from 'class-validator';
import { CompanySettings } from '../entities/company-settings.entity';

export class UpdateSettingsDto {
  @IsOptional() @IsString() company_name?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() vision?: string;
  @IsOptional() @IsString() mission?: string;
  @IsOptional() @IsString() footer_text?: string;
}

@Injectable()
export class SettingsService {
  constructor(@InjectRepository(CompanySettings) private repo: Repository<CompanySettings>) {}

  async get() {
    let settings = await this.repo.findOne({ where: { id: 1 } });
    if (!settings) {
      settings = this.repo.create({ id: 1, company_name: 'Mining Management System', address: '', phone: '' });
      await this.repo.save(settings);
    }
    return settings;
  }

  async update(dto: UpdateSettingsDto) {
    let settings = await this.repo.findOne({ where: { id: 1 } });
    if (!settings) settings = this.repo.create({ id: 1 });
    Object.assign(settings, dto);
    return this.repo.save(settings);
  }

  async updateLogo(logoUrl: string) {
    let settings = await this.repo.findOne({ where: { id: 1 } });
    if (!settings) settings = this.repo.create({ id: 1, company_name: 'Mining Management', address: '', phone: '' });
    settings.logo_url = logoUrl;
    return this.repo.save(settings);
  }
}
