import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, MapPin, Package, FileText, LogOut, Upload, Shield, Menu, X, Zap, ChevronRight, Smartphone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStore, ROLE_PERMISSIONS } from '../../store/useStore';
import { toast } from 'sonner';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useStore(state => state.user);
  const logout = useStore(state => state.logout);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const perms = ROLE_PERMISSIONS[user?.role] || {};
  const roleName = { admin: 'Yönetici', manager: 'Müdür', staff: 'Personel' }[user?.role] || user?.role;
  const roleGradient = { admin: 'from-purple-500 to-violet-600', manager: 'from-blue-500 to-blue-600', staff: 'from-emerald-500 to-emerald-600' }[user?.role] || 'from-slate-500 to-slate-600';

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true, show: true },
    { path: '/admin/inventory', icon: Package, label: 'Envanter', show: true },
    { path: '/admin/locations', icon: MapPin, label: 'Depolar', show: perms.canManageLocations },
    { path: '/admin/import', icon: Upload, label: 'Toplu Aktarım', show: perms.canImport },
    { path: '/admin/users', icon: Users, label: 'Kullanıcılar', show: perms.canManageUsers },
    { path: '/admin/reports', icon: FileText, label: 'Raporlar', show: perms.canViewReports },
  ].filter(m => m.show);

  const isActive = (item) => item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
  const pageName = menuItems.find(m => isActive(m))?.label || 'Yönetim Paneli';

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Oturum kapatıldı.');
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* ── Mobile Overlay ──────────────────────────────── */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col shrink-0
        bg-slate-900 border-r border-white/5
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/8 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Zap size={18} className="text-white fill-white" />
            </div>
            <div>
              <div className="text-sm font-black text-white tracking-tight leading-none">NexStock</div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5">Yönetim Paneli</div>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1.5 text-slate-500 hover:text-white rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* User card */}
        <div className="mx-3 mt-4 mb-2">
          <div className={`bg-gradient-to-br ${roleGradient} rounded-2xl p-3.5`}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-base shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">{user?.name}</div>
                <div className="text-xs text-white/60 flex items-center gap-1 mt-0.5">
                  <Shield size={10} /> {roleName}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-3">
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-2">Menü</div>
          <ul className="space-y-0.5">
            {menuItems.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                      active
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/8'
                    }`}
                  >
                    <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
                    <span className="text-sm font-semibold">{item.label}</span>
                    {active && <ChevronRight size={14} className="ml-auto opacity-60" />}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Divider */}
          <div className="h-px bg-white/8 mx-3 my-4" />

          {/* Terminal link */}
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/8 transition-all"
          >
            <Smartphone size={18} strokeWidth={1.8} />
            <span className="text-sm font-semibold">Terminal'e Dön</span>
          </Link>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/8 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all"
          >
            <LogOut size={18} strokeWidth={1.8} />
            <span className="text-sm font-semibold">Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-5 lg:px-7 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-1 rounded-xl text-slate-500 lg:hidden hover:bg-slate-100 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-base font-bold text-slate-800">{pageName}</h2>
              <p className="text-xs text-slate-400 hidden sm:block">NexStock Yönetim Paneli</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* User pill */}
            <div className={`hidden sm:flex items-center gap-2 bg-gradient-to-r ${roleGradient} text-white px-3 py-1.5 rounded-xl text-xs font-bold`}>
              <Shield size={12} />
              {roleName}
            </div>
            <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-black text-sm border border-slate-200">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-5 lg:p-7 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
