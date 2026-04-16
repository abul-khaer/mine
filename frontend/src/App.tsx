import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
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
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
