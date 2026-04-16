// ─── Auth & User ─────────────────────────────────────────────────────────────
export type Role =
  | 'super_admin'
  | 'admin_tambang'
  | 'finance'
  | 'accounting'
  | 'kepala_tambang'
  | 'manager_produksi'
  | 'staff'
  | 'hr'
  | 'manager_hr'
  | 'manager_finance'
  | 'procurement';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  mine_id?: number;
  mine?: Mine;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

// ─── Company ──────────────────────────────────────────────────────────────────
export interface CompanySettings {
  id: number;
  company_name: string;
  logo_url?: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
  updated_at: string;
}

// ─── Mine ─────────────────────────────────────────────────────────────────────
export interface Mine {
  id: number;
  name: string;
  location: string;
  address: string;
  area: number;          // luas dalam hektar
  mineral_type: string;
  phone: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
  employee_count?: number;
}

// ─── Employee ─────────────────────────────────────────────────────────────────
export interface Employee {
  id: number;
  mine_id: number;
  mine?: Mine;
  name: string;
  nik: string;
  position: string;      // jabatan
  department: string;    // departemen
  hire_date: string;
  status: 'active' | 'inactive';
  phone?: string;
  email?: string;
  created_at: string;
}

// ─── Reports ──────────────────────────────────────────────────────────────────
export interface ProductionReport {
  id: number;
  mine_id: number;
  mine?: Mine;
  date: string;
  target_volume: number;
  actual_volume: number;
  unit: string;
  notes?: string;
  created_by: number;
  created_at: string;
}

export interface FinancialReport {
  id: number;
  mine_id: number;
  mine?: Mine;
  date: string;
  income: number;
  expense: number;
  profit: number;
  category: string;
  notes?: string;
  created_by: number;
  created_at: string;
}

export interface ActivityReport {
  id: number;
  mine_id: number;
  mine?: Mine;
  date: string;
  activity: string;
  description: string;
  pic: string;           // penanggung jawab
  status: 'planned' | 'ongoing' | 'completed';
  created_by: number;
  created_at: string;
}

export interface IssueReport {
  id: number;
  mine_id: number;
  mine?: Mine;
  date: string;
  issue_title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved';
  resolution?: string;
  created_by: number;
  created_at: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ─── Filter ───────────────────────────────────────────────────────────────────
export interface ReportFilter {
  mine_id?: number;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}
