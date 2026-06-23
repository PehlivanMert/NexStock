import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, ScanBarcode, Package, User, Bell, ArrowLeft, Zap, Loader2 } from 'lucide-react';
import { useStore, ROLE_PERMISSIONS } from '../../store/useStore';

export default function TerminalLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isScanning = useStore((state) => state.isScanning);
  const user = useStore(state => state.user);
  const inventory = useStore(state => state.inventory);
  const dataLoaded = useStore(state => state.dataLoaded);

  const perms = ROLE_PERMISSIONS[user?.role] || {};
  const isHome = location.pathname === '/';

  const transferLog = useStore(state => state.transferLog) || [];
  const dismissedAlerts = useStore(state => state.dismissedAlerts) || [];
  const readAlerts = useStore(state => state.readAlerts) || [];

  // Real critical count for badge (scoped to active location)
  const locationInventory = user?.activeLocationId === 'all'
    ? inventory
    : inventory.filter(i => i.locationId === user?.activeLocationId);
  
  const lowStockAlerts = locationInventory.filter(i => i.quantity <= 0).map(i => `low-${i.id}`);
  const transferAlerts = transferLog.filter(t => new Date(t.date).toDateString() === new Date().toDateString()).map(t => `trans-${t.id}`);
  const unreadCount = [...lowStockAlerts, ...transferAlerts].filter(id => !dismissedAlerts.includes(id) && !readAlerts.includes(id)).length;

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

  const navItems = [
    { path: '/', icon: Home, label: 'Ana Sayfa', show: true },
    { path: '/scan', icon: ScanBarcode, label: 'Tara', show: true, isCTA: true },
    { path: '/inventory', icon: Package, label: 'Stok', show: true },
    { path: '/alerts', icon: Bell, label: 'Uyarılar', badge: unreadCount, show: true },
    { path: '/profile', icon: User, label: 'Profil', show: true },
  ].filter(n => n.show);

  if (!dataLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-slate-50">
        <Loader2 size={32} className="animate-spin text-primary-500 mb-4" />
        <p className="text-slate-500 text-sm font-medium animate-pulse">Veriler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-slate-50 h-full w-full overflow-hidden">
      {/* ── Header ─────────────────────────────────────────── */}
      {!isScanning && (
        <header
          className="glass border-b border-slate-200/60 shrink-0 z-20"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <div className="h-14 px-4 flex items-center justify-between max-w-lg mx-auto w-full">
            <div className="flex items-center gap-2.5">
              {!isHome ? (
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 -ml-2 text-slate-600 hover:text-primary-600 rounded-xl hover:bg-primary-50 transition-all active:scale-90"
                >
                  <ArrowLeft size={20} />
                </button>
              ) : (
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center shadow-md shadow-primary-500/30">
                  <Zap size={16} className="fill-white" />
                </div>
              )}
              <h1 className="font-bold text-base text-slate-800 tracking-tight">{pageTitle}</h1>
            </div>

            <div className="flex items-center gap-1">
              {/* Admin shortcut */}
              {perms.canAccessAdmin && (
                <Link
                  to="/admin"
                  className="text-xs font-bold bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Yönetim →
                </Link>
              )}
            </div>
          </div>
        </header>
      )}

      {/* ── Main Content ────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto relative min-h-0">
        <Outlet />
      </main>

      {/* ── Bottom Navigation ───────────────────────────────── */}
      {!isScanning && (
        <nav
          className="glass border-t border-slate-200/60 shrink-0 z-20"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
        >
          <div className="flex items-end justify-around max-w-lg mx-auto w-full px-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              if (item.isCTA) {
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex flex-col items-center py-2 flex-1"
                  >
                    <div
                      className={`relative h-13 w-13 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 active:scale-90 ${
                        isActive
                          ? 'bg-gradient-to-br from-primary-400 to-primary-600 shadow-primary-400/50 scale-105 animate-pulse-ring'
                          : 'bg-gradient-to-br from-primary-500 to-primary-700 shadow-primary-500/40'
                      }`}
                      style={{ height: '52px', width: '52px' }}
                    >
                      <Icon size={24} className="text-white" strokeWidth={2} />
                    </div>
                    <span className={`text-[10px] mt-1.5 font-semibold ${isActive ? 'text-primary-600' : 'text-slate-400'}`}>
                      {item.label}
                    </span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center py-2 px-1 flex-1 relative transition-all"
                >
                  <div className="relative">
                    {/* Active background glow */}
                    {isActive && (
                      <div className="absolute inset-0 -m-2 bg-primary-50 rounded-xl" />
                    )}
                    <Icon
                      size={22}
                      className={`relative transition-colors ${isActive ? 'text-primary-600' : 'text-slate-400'}`}
                      strokeWidth={isActive ? 2.5 : 1.8}
                    />
                    
                    {/* Badge */}
                    {item.badge > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center shadow-sm">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </div>

                  <span className={`text-[10px] mt-1.5 leading-none transition-colors ${isActive ? 'font-bold text-primary-600' : 'font-medium text-slate-400'}`}>
                    {item.label}
                  </span>
                  
                  {/* Active indicator dot (below text) */}
                  <div className={`mt-1 h-1 w-4 rounded-full shadow-sm transition-all ${isActive ? 'bg-primary-600 shadow-primary-400/50' : 'bg-transparent shadow-none'}`} />
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
