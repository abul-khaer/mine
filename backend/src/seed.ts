/**
 * Seeder: jalankan sekali untuk membuat Super Admin pertama
 * Perintah: npx ts-node src/seed.ts
 */
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

import { User } from './entities/user.entity';
import { CompanySettings } from './entities/company-settings.entity';
import { Mine } from './entities/mine.entity';
import { Employee } from './entities/employee.entity';
import { ProductionReport } from './entities/production-report.entity';
import { FinancialReport } from './entities/financial-report.entity';
import { ActivityReport } from './entities/activity-report.entity';
import { IssueReport } from './entities/issue-report.entity';

const ds = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'mining_management',
  entities: [User, CompanySettings, Mine, Employee,
             ProductionReport, FinancialReport, ActivityReport, IssueReport],
  synchronize: true,
});

async function seed() {
  await ds.initialize();
  console.log('Connected to database');

  const userRepo = ds.getRepository(User);
  const settingsRepo = ds.getRepository(CompanySettings);

  // Super Admin
  const exists = await userRepo.findOne({ where: { email: 'admin@mining.com' } });
  if (!exists) {
    const password = await bcrypt.hash('Admin@1234', 12);
    await userRepo.save(userRepo.create({
      name: 'Super Administrator',
      email: 'admin@mining.com',
      password,
      role: 'super_admin',
    }));
    console.log('✅ Super Admin created: admin@mining.com / Admin@1234');
  } else {
    console.log('ℹ️  Super Admin already exists');
  }

  // Company settings default
  const settingsExists = await settingsRepo.findOne({ where: { id: 1 } });
  if (!settingsExists) {
    await settingsRepo.save(settingsRepo.create({
      id: 1,
      company_name: 'PT. Mining Management System',
      address: 'Jl. Pertambangan No. 1, Jakarta Selatan',
      phone: '+62 21 1234 5678',
      email: 'info@mining.com',
    }));
    console.log('✅ Company settings created');
  }

  await ds.destroy();
  console.log('Done!');
}

seed().catch(console.error);
