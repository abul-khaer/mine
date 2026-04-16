import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterData } from '../entities/master-data.entity';
import { MasterDataService } from './master-data.service';
import { MasterDataController } from './master-data.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MasterData])],
  controllers: [MasterDataController],
  providers: [MasterDataService],
})
export class MasterDataModule {}
