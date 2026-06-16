import { Link, useNavigate } from 'react-router-dom';
import { ScanBarcode, ArrowRightLeft, ClipboardList, AlertTriangle, UploadCloud, MapPin, TrendingUp, Package, Bell } from 'lucide-react';
import { useStore, ROLE_PERMISSIONS } from '../store/useStore';

export default function Home() {
  const user = useStore(state => state.user);
  const inventory = useStore(state => state.inventory);
  const locations = useStore(state => state.locations);
  const transferLog = useStore(state => state.transferLog);

  const perms = ROLE_PERMISSIONS[user?.role] || {};

  // Real stats
  const activeLocation = locations.find(l => l.id === user?.activeLocationId);
  const locationInventory = inventory.filter(i => i.locationId === user?.activeLocationId);
  const totalItems = locationInventory.reduce((sum, i) => sum + i.quantity, 0);

  // Count transfers today
  const today = new Date().toDateString();
  const todayTransfers = transferLog.filter(t => new Date(t.date).toDateString() === today);

  // Critical stock items
  const criticalItems = inventory.filter(i => i.quantity < 10 && i.locationId === user?.activeLocationId);

  const quickActions = [
    { to: '/scan', icon: ScanBarcode, label: 'Hızlı Tarama', color: 'bg-blue-50 text-blue-600', show: true },
    { to: '/transfer', icon: ArrowRightLeft, label: 'Transfer', color: 'bg-purple-50 text-purple-600', show: perms.canTransfer },
    { to: '/count', icon: ClipboardList, label: 'Sayım', color: 'bg-green-50 text-green-600', show: perms.canCount },
    { to: '/alerts', icon: AlertTriangle, label: 'Uyarılar', color: 'bg-orange-50 text-orange-600', show: true },
    { to: '/admin/import', icon: UploadCloud, label: 'Excel/PDF\nAktar', color: 'bg-teal-50 text-teal-600', show: perms.canImport },
    { to: '/admin/locations', icon: MapPin, label: 'Yönetim\n(Depolar)', color: 'bg-slate-100 text-slate-600', show: perms.canManageLocations },
  ].filter(a => a.show);

  return (
    <div className="p-4 space-y-5 pb-24">
      {/* Hero card */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-5 text-white shadow-lg shadow-primary-500/30">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold">Merhaba, {user?.name?.split(' ')[0]}</h2>
            <p className="text-primary-100 text-sm mt-0.5">
              {activeLocation?.name || 'Tüm Lokasyonlar'}'da aktifsiniz
            </p>
          </div>
          <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
            {user?.name?.charAt(0)}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/15 rounded-xl p-3">
            <div className="text-2xl font-bold">{totalItems}</div>
            <div className="text-xs text-primary-100 mt-0.5">Toplam Stok</div>
          </div>
          <div className="bg-white/15 rounded-xl p-3">
            <div className="text-2xl font-bold">{todayTransfers.length}</div>
            <div className="text-xs text-primary-100 mt-0.5">Bugün Transfer</div>
          </div>
          <div className="bg-white/15 rounded-xl p-3 cursor-pointer" onClick={() => {}}>
            <div className={`text-2xl font-bold ${criticalItems.length > 0 ? 'text-red-300' : ''}`}>
              {criticalItems.length}
            </div>
            <div className="text-xs text-primary-100 mt-0.5">Kritik Stok</div>
          </div>
        </div>
      </div>

      {/* Critical alert if any */}
      {criticalItems.length > 0 && (
        <Link to="/alerts" className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-3.5">
          <div className="h-8 w-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
            <Bell size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-red-700">{criticalItems.length} Kritik Stok Uyarısı</div>
            <div className="text-xs text-red-500 truncate">Bazı ürünler eşik seviyenin altında</div>
          </div>
          <span className="text-red-500 text-sm">→</span>
        </Link>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="font-semibold text-slate-800 mb-3 px-1">Hızlı İşlemler</h3>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map(({ to, icon: Icon, label, color }) => (
            <Link
              key={to}
              to={to}
              className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-2.5 active:scale-95 transition-transform"
            >
              <div className={`h-11 w-11 rounded-full ${color} flex items-center justify-center`}>
                <Icon size={22} />
              </div>
              <span className="font-medium text-slate-700 text-xs text-center leading-tight whitespace-pre-line">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Transfers */}
      {todayTransfers.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-800 mb-3 px-1">Bugünkü Transferler</h3>
          <div className="space-y-2">
            {todayTransfers.slice(-3).reverse().map(t => (
              <div key={t.id} className="bg-white rounded-xl p-3 border border-slate-100 flex items-center gap-3">
                <div className="h-8 w-8 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center shrink-0">
                  <ArrowRightLeft size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-700 truncate">{t.from} → {t.to}</div>
                  <div className="text-xs text-slate-400">{t.items?.length} ürün · {new Date(t.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
