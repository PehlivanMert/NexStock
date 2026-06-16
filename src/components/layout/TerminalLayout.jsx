import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, ScanBarcode, Package, User, Bell, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useStore, ROLE_PERMISSIONS } from '../../store/useStore';

export default function TerminalLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isScanning = useStore((state) => state.isScanning);
  const user = useStore(state => state.user);
  const inventory = useStore(state => state.inventory);

  const perms = ROLE_PERMISSIONS[user?.role] || {};
  const isHome = location.pathname === '/';

  // Real critical count for badge (scoped to active location)
  const locationInventory = inventory.filter(i => i.locationId === user?.activeLocationId);
  const criticalCount = locationInventory.filter(i => i.quantity < 10).length;

  const pageTitle = {
    '/': 'NexStock',
    '/scan': 'Barkod Tara',
    '/inventory': 'Stok Listesi',
    '/transfer': 'Transfer',
    '/count': 'Sayım',
    '/profile': 'Profil',
    '/alerts': 'Uyarılar',
    '/add': 'Ürün Ekle',
  }[location.pathname] || 'NexStock';

  return (
    <div className="flex flex-col h-screen bg-slate-50 max-w-lg mx-auto">
      {/* Header */}
      {!isScanning && (
        <header className="bg-white border-b border-slate-100 px-4 h-14 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {!isHome ? (
              <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 hover:text-primary-600 rounded-full hover:bg-slate-100 transition-colors">
                <ArrowLeft size={20} />
              </button>
            ) : (
              <div className="h-7 w-7 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-xs">N</div>
            )}
            <h1 className="font-bold text-base text-slate-800">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-1">
            {/* Alert badge */}
            <Link to="/alerts" className="relative p-2 text-slate-400 hover:text-orange-500 transition-colors">
              <Bell size={20} />
              {criticalCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {criticalCount}
                </span>
              )}
            </Link>

            {/* Admin panel shortcut (role-based) */}
            {perms.canAccessAdmin && (
              <Link to="/admin" className="text-xs font-bold bg-slate-800 text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">
                Yönetim →
              </Link>
            )}
          </div>
        </header>
      )}

      {/* Main */}
      <main className="flex-1 overflow-y-auto relative">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      {!isScanning && (
        <nav className="bg-white border-t border-slate-200 flex items-center justify-around shrink-0" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {[
            { path: '/', icon: Home, label: 'Ana Sayfa', show: true },
            { path: '/scan', icon: ScanBarcode, label: 'Tara', show: true },
            { path: '/inventory', icon: Package, label: 'Stok', show: true },
            { path: '/alerts', icon: AlertTriangle, label: 'Uyarılar', badge: criticalCount, show: true },
            { path: '/profile', icon: User, label: 'Profil', show: true },
          ].filter(n => n.show).map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2.5 px-3 flex-1 transition-colors relative ${
                  isActive ? 'text-primary-600' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-600 rounded-full" />
                )}
                <div className="relative">
                  <Icon size={22} className={isActive ? 'stroke-2' : 'stroke-[1.5]'} />
                  {item.badge > 0 && !isActive && (
                    <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
