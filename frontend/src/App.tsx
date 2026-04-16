import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useDocumentMeta } from './hooks/useDocumentMeta';
import { useRoleAccessStore } from './store/roleAccessStore';
import api from './services/api';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';

// Public pages
import LandingPage from './pages/Landing/LandingPage';
import LoginPage from './pages/Auth/LoginPage';

// Protected pages
import Dashboard from './pages/Dashboard/Dashboard';
import MineList from './pages/Mines/MineList';
import EmployeeList from './pages/Employees/EmployeeList';
import ReportEmployee from './pages/Reports/ReportEmployee';
import ReportProduction from './pages/Reports/ReportProduction';
import ReportFinancial from './pages/Reports/ReportFinancial';
import ReportActivity from './pages/Reports/ReportActivity';
import ReportIssue from './pages/Reports/ReportIssue';
import SettingsPage from './pages/Settings/SettingsPage';
import UserManagement from './pages/Users/UserManagement';
import NotFound from './pages/NotFound';
import MasterDataPage from './pages/MasterData/MasterDataPage';
import RoleAccessPage from './pages/RoleAccess/RoleAccessPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppContent() {
  useDocumentMeta();

  const token = useAuthStore((s) => s.token);
  const setFromApi = useRoleAccessStore((s) => s.setFromApi);

  useEffect(() => {
    if (!token) return;
    api.get('/role-access')
      .then((r) => setFromApi(r.data))
      .catch(() => {}); // keep static fallback on error
  }, [token, setFromApi]);

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="mines" element={<MineList />} />
        <Route path="employees" element={<EmployeeList />} />
        <Route path="reports/employee" element={<ReportEmployee />} />
        <Route path="reports/production" element={<ReportProduction />} />
        <Route path="reports/financial" element={<ReportFinancial />} />
        <Route path="reports/activity" element={<ReportActivity />} />
        <Route path="reports/issue" element={<ReportIssue />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="master-data" element={<MasterDataPage />} />
        <Route path="role-access" element={<RoleAccessPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
