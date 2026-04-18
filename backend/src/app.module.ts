import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MinesModule } from './mines/mines.module';
import { EmployeesModule } from './employees/employees.module';
import { ReportsModule } from './reports/reports.module';
import { SettingsModule } from './settings/settings.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuditModule } from './audit/audit.module';

import { CompanySettings } from './entities/company-settings.entity';
import { Mine } from './entities/mine.entity';
import { Employee } from './entities/employee.entity';
import { User } from './entities/user.entity';
import { ProductionReport } from './entities/production-report.entity';
import { FinancialReport } from './entities/financial-report.entity';
import { ActivityReport } from './entities/activity-report.entity';
import { IssueReport } from './entities/issue-report.entity';
import { AuditLog } from './entities/audit-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // ═══ OWASP A07: Brute Force Protection — Rate Limiting ═══
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,   // 1 second
        limit: 5,    // max 5 requests per second
      },
      {
        name: 'medium',
        ttl: 10000,  // 10 seconds
        limit: 30,   // max 30 requests per 10 seconds
      },
      {
        name: 'long',
        ttl: 60000,  // 1 minute
        limit: 100,  // max 100 requests per minute
      },
    ]),

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
                   AuditLog],
        synchronize: true,
        timezone: '+07:00',
      }),
      inject: [ConfigService],
    }),

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    AuthModule,
    UsersModule,
    MinesModule,
    EmployeesModule,
    ReportsModule,
    SettingsModule,
    DashboardModule,
    AuditModule,
  ],
  providers: [
    // ═══ Apply rate limiting globally ═══
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
