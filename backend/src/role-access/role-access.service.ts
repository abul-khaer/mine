import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleAccess } from '../entities/role-access.entity';

export interface RoleAccessItem {
  menu_key: string;
  role: string;
  has_access: boolean;
}

@Injectable()
export class RoleAccessService {
  constructor(
    @InjectRepository(RoleAccess)
    private repo: Repository<RoleAccess>,
  ) {}

  findAll(): Promise<RoleAccess[]> {
    return this.repo.find({ order: { menu_key: 'ASC', role: 'ASC' } });
  }

  async updateBulk(items: RoleAccessItem[]): Promise<RoleAccess[]> {
    // Delete all existing rows then re-insert the full matrix
    await this.repo.createQueryBuilder().delete().execute();
    const entities = items.map((i) => this.repo.create(i));
    await this.repo.save(entities);
    return this.findAll();
  }
}
