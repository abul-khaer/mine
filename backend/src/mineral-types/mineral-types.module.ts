import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MineralType } from '../entities/mineral-type.entity';
import { MineralTypesService } from './mineral-types.service';
import { MineralTypesController } from './mineral-types.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MineralType])],
  controllers: [MineralTypesController],
  providers: [MineralTypesService],
})
export class MineralTypesModule {}
