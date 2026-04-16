import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MinesModule } from './mines/mines.module';
import { EmployeesModule } from './employees/employees.module';
import { ReportsModule } from './reports/reports.module';
import { SettingsModule } from './settings/settings.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MineralTypesModule } from './mineral-types/mineral-types.module';

import { CompanySettings } from './entities/company-settings.entity';
import { Mine } from './entities/mine.entity';
import { Employee } from './entities/employee.entity';
import { User } from './entities/user.entity';
import { ProductionReport } from './entities/production-report.entity';
import { FinancialReport } from './entities/financial-report.entity';
import { ActivityReport } from './entities/activity-report.entity';
import { IssueReport } from './entities/issue-report.entity';
import { MineralType } from './entities/mineral-type.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get('DB_USERNAME', 'root'),
        password: config.get('DB_PASSWORD', ''),
        database: config.get('DB_DATABASE', 'mining_management'),
        entities: [CompanySettings, Mine, Employee, User,
                   ProductionReport, FinancialReport, ActivityReport, IssueReport,
                   MineralType],
        synchronize: true,
        timezone: '+07:00',
      }),
      inject: [ConfigService],
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    AuthModule,
    UsersModule,
    MinesModule,
    EmployeesModule,
    ReportsModule,
    SettingsModule,
    DashboardModule,
    MineralTypesModule,
  ],
})
export class AppModule {}
