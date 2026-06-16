import { Link, useNavigate } from 'react-router-dom';
import {
  ScanBarcode, ArrowRightLeft, ClipboardList, AlertTriangle,
  UploadCloud, MapPin, Package, TrendingUp, TrendingDown,
  ChevronRight, Layers, Activity
} from 'lucide-react';
import { useStore, ROLE_PERMISSIONS } from '../store/useStore';

export default function Home() {
  const user = useStore(state => state.user);
  const inventory = useStore(state => state.inventory);
  const products = useStore(state => state.products);
  const locations = useStore(state => state.locations);
  const transferLog = useStore(state => state.transferLog);
  const navigate = useNavigate();

  const perms = ROLE_PERMISSIONS[user?.role] || {};
  const activeLocation = locations.find(l => l.id === user?.activeLocationId);

  // ── Stats ──────────────────────────────────────────────────
  const locationInventory = inventory.filter(i => i.locationId === user?.activeLocationId);
  const totalItems = locationInventory.reduce((sum, i) => sum + i.quantity, 0);
  const uniqueProducts = locationInventory.length;
  const criticalItems = locationInventory.filter(i => i.quantity < 10);

  const today = new Date().toDateString();
  const todayTransfers = transferLog.filter(t => new Date(t.date).toDateString() === today);
  const totalTransferredToday = todayTransfers.reduce((sum, t) => sum + (t.items?.length || 0), 0);

  // Top 4 products by quantity in active location
  const topProducts = locationInventory
    .map(inv => ({
      ...inv,
      productName: products.find(p => p.id === inv.productId)?.name || 'Bilinmeyen',
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 4);

  const maxQty = topProducts[0]?.quantity || 1;

  // Quick actions filtered by role
  const quickActions = [
    { to: '/scan', icon: ScanBarcode, label: 'Hızlı Tara', color: 'text-blue-600 bg-blue-50', show: true },
    { to: '/transfer', icon: ArrowRightLeft, label: 'Transfer', color: 'text-violet-600 bg-violet-50', show: perms.canTransfer },
    { to: '/count', icon: ClipboardList, label: 'Sayım', color: 'text-emerald-600 bg-emerald-50', show: perms.canCount },
    { to: '/admin/import', icon: UploadCloud, label: 'İçe Aktar', color: 'text-teal-600 bg-teal-50', show: perms.canImport },
    { to: '/alerts', icon: AlertTriangle, label: 'Uyarılar', color: 'text-orange-600 bg-orange-50', show: true },
    { to: '/admin/locations', icon: MapPin, label: 'Depolar', color: 'text-slate-600 bg-slate-100', show: perms.canManageLocations },
  ].filter(a => a.show);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar';

  return (
    <div className="px-4 py-5 space-y-5 pb-28 max-w-lg mx-auto">

      {/* ── Greeting ─────────────────────────────────── */}
      <div>
        <p className="text-sm text-slate-500 font-medium">{greeting},</p>
        <h1 className="text-2xl font-bold text-slate-900 mt-0.5">{user?.name}</h1>
        {activeLocation && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-sm text-slate-600 font-medium">{activeLocation.name}</span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-400 capitalize">{activeLocation.type === 'warehouse' ? 'Depo' : 'Mağaza'}</span>
          </div>
        )}
      </div>

      {/* ── KPI Row ───────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-1.5 mb-2">
            <Layers size={14} className="text-primary-500" />
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Toplam</span>
          </div>
          <div className="text-3xl font-bold text-slate-800 leading-none">{totalItems}</div>
          <div className="text-[11px] text-slate-500 mt-1">adet stok</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-1.5 mb-2">
            <Package size={14} className="text-violet-500" />
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Ürün</span>
          </div>
          <div className="text-3xl font-bold text-slate-800 leading-none">{uniqueProducts}</div>
          <div className="text-[11px] text-slate-500 mt-1">çeşit kayıtlı</div>
        </div>

        <button
          onClick={() => navigate('/alerts')}
          className={`rounded-2xl p-4 border shadow-sm text-left transition-colors ${
            criticalItems.length > 0
              ? 'bg-red-50 border-red-200'
              : 'bg-white border-slate-100'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle size={14} className={criticalItems.length > 0 ? 'text-red-500' : 'text-slate-400'} />
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Kritik</span>
          </div>
          <div className={`text-3xl font-bold leading-none ${criticalItems.length > 0 ? 'text-red-600' : 'text-slate-800'}`}>
            {criticalItems.length}
          </div>
          <div className={`text-[11px] mt-1 ${criticalItems.length > 0 ? 'text-red-500 font-medium' : 'text-slate-500'}`}>
            {criticalItems.length > 0 ? 'düşük stok!' : 'sorun yok ✓'}
          </div>
        </button>
      </div>

      {/* ── Stock Distribution Bar Chart ─────────────── */}
      {topProducts.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-primary-500" />
              <h2 className="text-sm font-bold text-slate-800">Stok Dağılımı</h2>
            </div>
            <button onClick={() => navigate('/inventory')} className="text-xs text-primary-600 font-semibold flex items-center gap-0.5">
              Tümü <ChevronRight size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {topProducts.map((item) => {
              const pct = Math.round((item.quantity / maxQty) * 100);
              const isCritical = item.quantity < 10;
              return (
                <div key={item.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-slate-700 truncate max-w-[65%]">{item.productName}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold ${isCritical ? 'text-red-600' : 'text-slate-700'}`}>{item.quantity}</span>
                      {isCritical && <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">DÜŞÜK</span>}
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isCritical ? 'bg-red-400' : 'bg-primary-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Today's Activity ─────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-emerald-500" />
          <h2 className="text-sm font-bold text-slate-800">Bugünkü Aktivite</h2>
        </div>

        {todayTransfers.length === 0 ? (
          <div className="flex items-center gap-3 py-2">
            <div className="h-9 w-9 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
              <Activity size={16} className="text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Bugün işlem yapılmadı</p>
              <p className="text-xs text-slate-400 mt-0.5">Transfer veya sayım başlatın</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {todayTransfers.slice(-3).reverse().map(t => (
              <div key={t.id} className="flex items-center gap-3">
                <div className="h-8 w-8 bg-violet-50 text-violet-600 rounded-full flex items-center justify-center shrink-0">
                  <ArrowRightLeft size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{t.from} → {t.to}</p>
                  <p className="text-xs text-slate-400">{t.items?.length} ürün · {new Date(t.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
            {todayTransfers.length > 3 && (
              <p className="text-xs text-slate-400 text-center pt-1">+{todayTransfers.length - 3} işlem daha</p>
            )}
          </div>
        )}
      </div>

      {/* ── Locations Summary ────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-blue-500" />
            <h2 className="text-sm font-bold text-slate-800">Lokasyon Özeti</h2>
          </div>
          {perms.canManageLocations && (
            <button onClick={() => navigate('/admin/locations')} className="text-xs text-primary-600 font-semibold flex items-center gap-0.5">
              Yönet <ChevronRight size={14} />
            </button>
          )}
        </div>

        <div className="space-y-2">
          {locations.filter(l => l.status === 'active').map(loc => {
            const locInv = inventory.filter(i => i.locationId === loc.id);
            const locTotal = locInv.reduce((s, i) => s + i.quantity, 0);
            const locCritical = locInv.filter(i => i.quantity < 10).length;
            const isActive = loc.id === user?.activeLocationId;

            return (
              <div key={loc.id} className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${isActive ? 'bg-primary-50 border-primary-200' : 'bg-slate-50 border-transparent'}`}>
                <div className="flex items-center gap-2.5">
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold ${isActive ? 'bg-primary-100 text-primary-700' : 'bg-white text-slate-500 border border-slate-200'}`}>
                    {loc.name.charAt(0)}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold leading-none ${isActive ? 'text-primary-700' : 'text-slate-700'}`}>{loc.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{loc.type === 'warehouse' ? 'Depo' : 'Mağaza'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <p className="text-sm font-bold text-slate-700">{locTotal}</p>
                    <p className="text-[10px] text-slate-400">adet</p>
                  </div>
                  {locCritical > 0 && (
                    <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">{locCritical} ⚠</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Quick Actions ─────────────────────────────── */}
      <div>
        <h2 className="text-sm font-bold text-slate-700 mb-3 px-0.5">Hızlı İşlemler</h2>
        <div className="grid grid-cols-3 gap-2.5">
          {quickActions.map(({ to, icon: Icon, label, color }) => (
            <Link
              key={to}
              to={to}
              className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-transform"
            >
              <div className={`h-11 w-11 rounded-xl ${color} flex items-center justify-center`}>
                <Icon size={21} />
              </div>
              <span className="text-xs font-semibold text-slate-700 text-center leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
