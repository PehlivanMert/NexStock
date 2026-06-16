import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, MapPin, Package, FileText, Settings, LogOut, Upload, ChevronDown, Shield, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStore, ROLE_PERMISSIONS } from '../../store/useStore';
import { toast } from 'sonner';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useStore(state => state.user);
  const logout = useStore(state => state.logout);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const perms = ROLE_PERMISSIONS[user?.role] || {};
  const roleName = { admin: 'Yönetici', manager: 'Müdür', staff: 'Personel' }[user?.role] || user?.role;

  const allMenuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true, show: true },
    { path: '/admin/inventory', icon: Package, label: 'Envanter', show: true },
    { path: '/admin/locations', icon: MapPin, label: 'Depolar', show: perms.canManageLocations },
    { path: '/admin/import', icon: Upload, label: 'Toplu Aktarım', show: perms.canImport },
    { path: '/admin/users', icon: Users, label: 'Kullanıcılar', show: perms.canManageUsers },
    { path: '/admin/reports', icon: FileText, label: 'Raporlar', show: perms.canViewReports },
  ];

  const menuItems = allMenuItems.filter(m => m.show);

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  const pageName = menuItems.find(m => isActive(m))?.label || 'Yönetim Paneli';

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Oturum kapatıldı.');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 transform transition-transform duration-200 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-14 lg:h-16 flex items-center px-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">N</div>
            <div>
              <div className="text-base font-bold text-slate-800 leading-none">NexStock</div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">Yönetim Paneli</div>
            </div>
          </div>
        </div>

        {/* User info in sidebar */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
              {user?.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-800 truncate">{user?.name}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Shield size={10} />
                {roleName}
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          <ul className="space-y-0.5 px-3">
            {menuItems.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      active ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={19} className={active ? 'stroke-2' : 'stroke-[1.5]'} />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-sm"
          >
            <LogOut size={18} />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 rounded-lg text-slate-500 lg:hidden hover:bg-slate-100 active:bg-slate-200">
              <Menu size={20} />
            </button>
            <h2 className="text-base font-semibold text-slate-800">{pageName}</h2>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/" className="text-xs font-medium text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors">
              ← Terminal
            </Link>

            {/* Settings Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setShowSettingsMenu(v => !v); setShowUserMenu(false); }}
                className={`p-2 rounded-lg transition-colors ${showSettingsMenu ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
              >
                <Settings size={19} />
              </button>
              {showSettingsMenu && (
                <div className="absolute right-0 top-11 bg-white rounded-xl border border-slate-200 shadow-xl w-52 z-50 overflow-hidden">
                  <div className="p-1">
                    {[
                      { emoji: '🔧', label: 'Sistem Ayarları', msg: 'Firebase bağlantısı sonrası aktif olacak.' },
                      { emoji: '🔔', label: 'Bildirim Ayarları', msg: 'Bildirim ayarlarını Terminal > Profil üzerinden yönetin.' },
                      { emoji: '🎨', label: 'Görünüm', msg: 'Tema ayarları Firebase sonrası gelecek.' },
                    ].map(({ emoji, label, msg }) => (
                      <button key={label} onClick={() => { toast.info(label, { description: msg }); setShowSettingsMenu(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg">
                        {emoji} {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setShowUserMenu(v => !v); setShowSettingsMenu(false); }}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                  {user?.name?.charAt(0)}
                </div>
                <span className="text-sm font-medium text-slate-700 hidden md:block">{user?.name}</span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-11 bg-white rounded-xl border border-slate-200 shadow-xl w-52 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="font-bold text-slate-800 text-sm">{user?.name}</div>
                    <div className="text-xs text-slate-500">{roleName} · {user?.email}</div>
                  </div>
                  <div className="p-1">
                    <button onClick={() => { navigate('/profile'); setShowUserMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg font-medium">
                      👤 Profilim
                    </button>
                    <button onClick={() => { navigate('/profile'); setShowUserMenu(false); toast.info('Profil sayfasından hesap ayarlarına erişebilirsiniz.'); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg font-medium">
                      ⚙️ Hesap Ayarları
                    </button>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium">
                      🚪 Çıkış Yap
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {(showUserMenu || showSettingsMenu) && (
          <div className="fixed inset-0 z-40" onClick={() => { setShowUserMenu(false); setShowSettingsMenu(false); }} />
        )}

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
