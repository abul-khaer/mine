import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mine } from '../entities/mine.entity';
import { Employee } from '../entities/employee.entity';
import { MinesController } from './mines.controller';
import { MinesService } from './mines.service';

@Module({
  imports: [TypeOrmModule.forFeature([Mine, Employee])],
  controllers: [MinesController],
  providers: [MinesService],
  exports: [MinesService],
})
export class MinesModule {}
