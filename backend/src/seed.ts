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
import { MineralType } from './entities/mineral-type.entity';
import { MasterData } from './entities/master-data.entity';
import { RoleAccess } from './entities/role-access.entity';

const ds = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'mining_management',
  entities: [User, CompanySettings, Mine, Employee,
             ProductionReport, FinancialReport, ActivityReport, IssueReport,
             MineralType, MasterData, RoleAccess],
  synchronize: true,
});

async function seed() {
  await ds.initialize();
  console.log('Connected to database');

  const userRepo = ds.getRepository(User);
  const settingsRepo = ds.getRepository(CompanySettings);
  const mineralRepo = ds.getRepository(MineralType);
  const masterDataRepo = ds.getRepository(MasterData);
  const roleAccessRepo = ds.getRepository(RoleAccess);

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

  // Mineral types default
  const defaultMinerals = [
    { name: 'Batubara', description: 'Coal / batu bara' },
    { name: 'Emas', description: 'Gold / emas' },
    { name: 'Nikel', description: 'Nickel / nikel' },
    { name: 'Tembaga', description: 'Copper / tembaga' },
    { name: 'Bauksit', description: 'Bauxite / bauksit' },
    { name: 'Besi', description: 'Iron ore / bijih besi' },
    { name: 'Perak', description: 'Silver / perak' },
    { name: 'Timah', description: 'Tin / timah' },
    { name: 'Mangan', description: 'Manganese / mangan' },
    { name: 'Seng', description: 'Zinc / seng' },
    { name: 'Granit', description: 'Granite / granit' },
    { name: 'Pasir Kuarsa', description: 'Quartz sand / pasir kuarsa' },
  ];
  let addedMinerals = 0;
  for (const m of defaultMinerals) {
    const exists = await mineralRepo.findOne({ where: { name: m.name } });
    if (!exists) {
      await mineralRepo.save(mineralRepo.create(m));
      addedMinerals++;
    }
  }
  if (addedMinerals > 0) console.log(`✅ ${addedMinerals} mineral type(s) added`);
  else console.log('ℹ️  Mineral types already exist');

  // Master Data seed
  const masterDataItems: { category: string; name: string; description: string }[] = [
    // mineral_type
    { category: 'mineral_type', name: 'Batubara', description: 'Coal / batu bara' },
    { category: 'mineral_type', name: 'Emas', description: 'Gold / emas' },
    { category: 'mineral_type', name: 'Nikel', description: 'Nickel / nikel' },
    { category: 'mineral_type', name: 'Tembaga', description: 'Copper / tembaga' },
    { category: 'mineral_type', name: 'Bauksit', description: 'Bauxite / bauksit' },
    { category: 'mineral_type', name: 'Besi', description: 'Iron ore / bijih besi' },
    { category: 'mineral_type', name: 'Perak', description: 'Silver / perak' },
    { category: 'mineral_type', name: 'Timah', description: 'Tin / timah' },
    { category: 'mineral_type', name: 'Mangan', description: 'Manganese / mangan' },
    { category: 'mineral_type', name: 'Seng', description: 'Zinc / seng' },
    { category: 'mineral_type', name: 'Granit', description: 'Granite / granit' },
    { category: 'mineral_type', name: 'Pasir Kuarsa', description: 'Quartz sand / pasir kuarsa' },
    // position
    { category: 'position', name: 'Direktur', description: 'Jabatan Direktur' },
    { category: 'position', name: 'Manager', description: 'Jabatan Manager' },
    { category: 'position', name: 'Supervisor', description: 'Jabatan Supervisor' },
    { category: 'position', name: 'Kepala Regu', description: 'Jabatan Kepala Regu' },
    { category: 'position', name: 'Operator', description: 'Jabatan Operator' },
    { category: 'position', name: 'Teknisi', description: 'Jabatan Teknisi' },
    { category: 'position', name: 'Driver', description: 'Jabatan Driver' },
    { category: 'position', name: 'Admin', description: 'Jabatan Admin' },
    { category: 'position', name: 'Staff', description: 'Jabatan Staff' },
    { category: 'position', name: 'Security', description: 'Jabatan Security' },
    // department
    { category: 'department', name: 'Operasional', description: 'Departemen Operasional' },
    { category: 'department', name: 'Produksi', description: 'Departemen Produksi' },
    { category: 'department', name: 'Keuangan', description: 'Departemen Keuangan' },
    { category: 'department', name: 'HR & Umum', description: 'Departemen HR & Umum' },
    { category: 'department', name: 'Teknik', description: 'Departemen Teknik' },
    { category: 'department', name: 'K3', description: 'Departemen K3' },
    { category: 'department', name: 'Logistik', description: 'Departemen Logistik' },
    { category: 'department', name: 'IT', description: 'Departemen IT' },
    { category: 'department', name: 'Legal', description: 'Departemen Legal' },
    { category: 'department', name: 'Procurement', description: 'Departemen Procurement' },
    // financial_category
    { category: 'financial_category', name: 'Pendapatan Produksi', description: 'Kategori pendapatan dari hasil produksi' },
    { category: 'financial_category', name: 'Biaya Operasional', description: 'Kategori biaya operasional' },
    { category: 'financial_category', name: 'Biaya Tenaga Kerja', description: 'Kategori biaya tenaga kerja' },
    { category: 'financial_category', name: 'Biaya Bahan Bakar', description: 'Kategori biaya bahan bakar' },
    { category: 'financial_category', name: 'Biaya Perawatan Alat', description: 'Kategori biaya perawatan alat berat' },
    { category: 'financial_category', name: 'Biaya Administrasi', description: 'Kategori biaya administrasi' },
    { category: 'financial_category', name: 'Biaya K3', description: 'Kategori biaya keselamatan dan kesehatan kerja' },
    { category: 'financial_category', name: 'Pendapatan Lainnya', description: 'Kategori pendapatan lainnya' },
    { category: 'financial_category', name: 'Pengeluaran Lainnya', description: 'Kategori pengeluaran lainnya' },
    // activity_category
    { category: 'activity_category', name: 'Penambangan', description: 'Kegiatan penambangan' },
    { category: 'activity_category', name: 'Perawatan Alat Berat', description: 'Kegiatan perawatan alat berat' },
    { category: 'activity_category', name: 'Pelatihan', description: 'Kegiatan pelatihan karyawan' },
    { category: 'activity_category', name: 'Inspeksi K3', description: 'Kegiatan inspeksi keselamatan dan kesehatan kerja' },
    { category: 'activity_category', name: 'Rapat Koordinasi', description: 'Kegiatan rapat koordinasi' },
    { category: 'activity_category', name: 'Pengiriman', description: 'Kegiatan pengiriman hasil tambang' },
    { category: 'activity_category', name: 'Survey Lahan', description: 'Kegiatan survey lahan tambang' },
    { category: 'activity_category', name: 'Reklamasi', description: 'Kegiatan reklamasi lahan' },
  ];

  let addedMasterData = 0;
  for (const item of masterDataItems) {
    const exists = await masterDataRepo.findOne({
      where: { category: item.category, name: item.name },
    });
    if (!exists) {
      await masterDataRepo.save(masterDataRepo.create(item));
      addedMasterData++;
    }
  }
  if (addedMasterData > 0) console.log(`✅ ${addedMasterData} master data item(s) added`);
  else console.log('ℹ️  Master data items already exist');

  // Role Access defaults
  const allMenus = [
    'dashboard', 'mines', 'employees', 'master_data',
    'reports_employee', 'reports_production', 'reports_financial',
    'reports_activity', 'reports_issue',
    'users', 'settings', 'role_access',
  ];
  const allRoles = [
    'super_admin', 'admin_tambang', 'finance', 'accounting',
    'kepala_tambang', 'manager_produksi', 'staff', 'hr',
    'manager_hr', 'manager_finance', 'procurement',
  ];
  const defaultAccess: Record<string, string[]> = {
    dashboard:          allRoles, // semua role bisa akses dashboard
    mines:              ['super_admin', 'admin_tambang', 'kepala_tambang', 'manager_produksi'],
    employees:          ['super_admin', 'admin_tambang', 'hr', 'manager_hr'],
    master_data:        ['super_admin', 'admin_tambang'],
    reports_employee:   ['super_admin', 'admin_tambang', 'hr', 'manager_hr'],
    reports_production: ['super_admin', 'admin_tambang', 'kepala_tambang', 'manager_produksi', 'staff'],
    reports_financial:  ['super_admin', 'finance', 'accounting', 'manager_finance'],
    reports_activity:   ['super_admin', 'admin_tambang', 'kepala_tambang', 'manager_produksi', 'staff'],
    reports_issue:      ['super_admin', 'admin_tambang', 'kepala_tambang', 'manager_produksi'],
    users:              ['super_admin'],
    settings:           ['super_admin'],
    role_access:        ['super_admin'],
  };

  const existingCount = await roleAccessRepo.count();
  if (existingCount === 0) {
    const items: Partial<RoleAccess>[] = [];
    for (const menu of allMenus) {
      for (const role of allRoles) {
        items.push({ menu_key: menu, role, has_access: defaultAccess[menu]?.includes(role) ?? false });
      }
    }
    await roleAccessRepo.save(roleAccessRepo.create(items as any));
    console.log(`✅ ${items.length} role access entries seeded`);
  } else {
    console.log('ℹ️  Role access already seeded');
  }

  await ds.destroy();
  console.log('Done!');
}

seed().catch(console.error);
