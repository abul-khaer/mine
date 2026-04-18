import { useState, useEffect } from 'react';
import { Shield, Filter, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import api from '../../services/api';

interface AuditLog {
  id: number;
  user_id: number;
  user_email: string;
  action: string;
  resource: string;
  resource_id: number | null;
  details: string | null;
  ip_address: string | null;
  user_agent: string | null;
  status: string;
  created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'bg-green-100 text-green-800',
  LOGOUT: 'bg-gray-100 text-gray-800',
  LOGIN_FAILED: 'bg-red-100 text-red-800',
  ACCOUNT_LOCKED: 'bg-red-200 text-red-900',
  CREATE: 'bg-blue-100 text-blue-800',
  UPDATE: 'bg-yellow-100 text-yellow-800',
  DELETE: 'bg-red-100 text-red-700',
  PASSWORD_RESET: 'bg-purple-100 text-purple-800',
  '2FA_GENERATE': 'bg-indigo-100 text-indigo-800',
  '2FA_ENABLED': 'bg-green-100 text-green-700',
  '2FA_DISABLED': 'bg-orange-100 text-orange-800',
};

const STATUS_COLORS: Record<string, string> = {
  success: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  blocked: 'bg-red-200 text-red-900',
};

export default function AuditLogPage() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filterAction, setFilterAction] = useState('');
  const [filterResource, setFilterResource] = useState('');
  const limit = 20;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit };
      if (filterAction) params.action = filterAction;
      if (filterResource) params.resource = filterResource;
      const { data } = await api.get('/audit/logs', { params });
      setLogs(data.data);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch {
      // handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [page, filterAction, filterResource]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  const parseDetails = (details: string | null) => {
    if (!details) return null;
    try { return JSON.parse(details); } catch { return null; }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-forest-900 flex items-center gap-2">
            <Shield className="text-primary-600" size={24} />
            Audit Log
          </h1>
          <p className="text-sm text-earth-500 mt-1">
            ISO 27001 A.12.4 — Logging & Monitoring ({total} total records)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <Filter size={16} className="text-earth-500" />
          <select
            value={filterAction}
            onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
            className="input-field w-auto text-sm"
          >
            <option value="">Semua Aksi</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="LOGIN_FAILED">Login Gagal</option>
            <option value="ACCOUNT_LOCKED">Akun Terkunci</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="PASSWORD_RESET">Reset Password</option>
            <option value="2FA_ENABLED">2FA Enabled</option>
            <option value="2FA_DISABLED">2FA Disabled</option>
          </select>
          <select
            value={filterResource}
            onChange={(e) => { setFilterResource(e.target.value); setPage(1); }}
            className="input-field w-auto text-sm"
          >
            <option value="">Semua Resource</option>
            <option value="auth">Auth</option>
            <option value="user">User</option>
            <option value="mine">Tambang</option>
            <option value="employee">Karyawan</option>
            <option value="settings">Settings</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-forest-50/80 border-b border-earth-200">
                <th className="text-left px-4 py-3 font-semibold text-forest-800">Waktu</th>
                <th className="text-left px-4 py-3 font-semibold text-forest-800">User</th>
                <th className="text-left px-4 py-3 font-semibold text-forest-800">Aksi</th>
                <th className="text-left px-4 py-3 font-semibold text-forest-800">Resource</th>
                <th className="text-left px-4 py-3 font-semibold text-forest-800">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-forest-800">IP Address</th>
                <th className="text-left px-4 py-3 font-semibold text-forest-800">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-earth-400">Memuat...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-earth-400">Belum ada log</td></tr>
              ) : (
                logs.map((log) => {
                  const details = parseDetails(log.details);
                  return (
                    <tr key={log.id} className="hover:bg-cream-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-earth-600">
                          <Clock size={13} />
                          <span className="text-xs">{formatDate(log.created_at)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <User size={13} className="text-earth-400" />
                          <span className="text-xs text-forest-700">{log.user_email || '-'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-700'}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-forest-700">
                        {log.resource}
                        {log.resource_id && <span className="text-earth-400 ml-1">#{log.resource_id}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[log.status] || 'bg-gray-100 text-gray-700'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-earth-500 font-mono">
                        {log.ip_address || '-'}
                      </td>
                      <td className="px-4 py-3 text-xs text-earth-500 max-w-[200px] truncate">
                        {details ? JSON.stringify(details) : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-earth-100">
            <span className="text-xs text-earth-500">
              Halaman {page} dari {totalPages} ({total} record)
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-earth-100 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-earth-100 disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
