import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleAccess } from '../entities/role-access.entity';
import { RoleAccessService } from './role-access.service';
import { RoleAccessController } from './role-access.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RoleAccess])],
  providers: [RoleAccessService],
  controllers: [RoleAccessController],
})
export class RoleAccessModule {}
