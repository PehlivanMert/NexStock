import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useStore } from './store/useStore';
import Login from './pages/Login';
import TerminalLayout from './components/layout/TerminalLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import Home from './pages/Home';
import ScannerPage from './pages/ScannerPage';
import Inventory from './pages/Inventory';
import Transfer from './pages/Transfer';
import Count from './pages/Count';
import Profile from './pages/Profile';
import Alerts from './pages/Alerts';
import AddProduct from './pages/AddProduct';
import BulkImport from './pages/BulkImport';
import Locations from './pages/admin/Locations';
import AdminDashboard from './pages/admin/Dashboard';
import AdminInventory from './pages/admin/AdminInventory';
import Users from './pages/admin/Users';
import Reports from './pages/admin/Reports';
import { ROLE_PERMISSIONS } from './store/useStore';

// Protected route wrapper
function ProtectedRoute({ children, permission }) {
  const isLoggedIn = useStore(state => state.isLoggedIn);
  const user = useStore(state => state.user);

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  if (permission) {
    const perms = ROLE_PERMISSIONS[user?.role] || {};
    if (!perms[permission]) return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const isLoggedIn = useStore(state => state.isLoggedIn);

  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors />
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/" replace /> : <Login />}
        />

        {/* Terminal (Mobile) Routes */}
        <Route path="/" element={<ProtectedRoute><TerminalLayout /></ProtectedRoute>}>
          <Route index element={<Home />} />
          <Route path="scan" element={<ScannerPage />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="add" element={<ProtectedRoute permission="canDeleteInventory"><AddProduct /></ProtectedRoute>} />
          <Route path="transfer" element={<ProtectedRoute permission="canTransfer"><Transfer /></ProtectedRoute>} />
          <Route path="count" element={<ProtectedRoute permission="canCount"><Count /></ProtectedRoute>} />
          <Route path="profile" element={<Profile />} />
          <Route path="alerts" element={<Alerts />} />
        </Route>

        {/* Admin Dashboard (Desktop) Routes */}
        <Route path="/admin" element={<ProtectedRoute permission="canAccessAdmin"><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="locations" element={<ProtectedRoute permission="canManageLocations"><Locations /></ProtectedRoute>} />
          <Route path="users" element={<ProtectedRoute permission="canManageUsers"><Users /></ProtectedRoute>} />
          <Route path="reports" element={<ProtectedRoute permission="canViewReports"><Reports /></ProtectedRoute>} />
          <Route path="import" element={<ProtectedRoute permission="canImport"><BulkImport /></ProtectedRoute>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to={isLoggedIn ? '/' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
