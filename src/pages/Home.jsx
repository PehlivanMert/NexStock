import { Link, useNavigate } from 'react-router-dom';
import {
  ScanBarcode, ArrowRightLeft, ClipboardList, AlertTriangle,
  UploadCloud, MapPin, Package, TrendingUp,
  ChevronRight, Layers, Activity, Zap, Bell
} from 'lucide-react';
import { useStore, ROLE_PERMISSIONS } from '../store/useStore';

export default function Home() {
  const user = useStore(state => state.user);
  const inventory = useStore(state => state.inventory);
  const products = useStore(state => state.products);
  const locations = useStore(state => state.locations);
  const transferLog = useStore(state => state.transferLog);
  const updateProfile = useStore(state => state.updateProfile);
  const navigate = useNavigate();

  const handleLocationClick = (locId) => {
    updateProfile({ activeLocationId: locId });
    navigate('/inventory');
  };

  const perms = ROLE_PERMISSIONS[user?.role] || {};
  const activeLocation = user?.activeLocationId === 'all'
    ? { name: 'Tüm Lokasyonlar', type: 'all' }
    : locations.find(l => l.id === user?.activeLocationId);

  // ── Stats ──────────────────────────────────────────────────
  const locationInventory = user?.activeLocationId === 'all'
    ? inventory
    : inventory.filter(i => i.locationId === user?.activeLocationId);
  const totalItems = locationInventory.reduce((sum, i) => sum + i.quantity, 0);
  const uniqueProducts = locationInventory.length;
  const criticalItems = locationInventory.filter(i => i.quantity <= 0);

  const today = new Date().toDateString();
  const todayTransfers = transferLog.filter(t => new Date(t.date).toDateString() === today);

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
    { to: '/scan', icon: ScanBarcode, label: 'Hızlı Tara', gradient: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-400/30', show: true },
    { to: '/transfer', icon: ArrowRightLeft, label: 'Transfer', gradient: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-400/30', show: perms.canTransfer },
    { to: '/count', icon: ClipboardList, label: 'Sayım', gradient: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-400/30', show: perms.canCount },
    { to: '/admin/import', icon: UploadCloud, label: 'İçe Aktar', gradient: 'from-teal-500 to-teal-600', shadow: 'shadow-teal-400/30', show: perms.canImport },
    { to: '/alerts', icon: AlertTriangle, label: 'Uyarılar', gradient: 'from-orange-500 to-red-500', shadow: 'shadow-orange-400/30', show: true },
    { to: '/admin/locations', icon: MapPin, label: 'Depolar', gradient: 'from-slate-600 to-slate-700', shadow: 'shadow-slate-400/30', show: perms.canManageLocations },
  ].filter(a => a.show);

  const hour = new Date().getHours();
  const greeting = hour < 6 ? 'İyi geceler' : hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar';

  const kpiCards = [
    {
      icon: Layers,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      label: 'Toplam',
      value: totalItems.toLocaleString('tr-TR'),
      sub: 'adet stok',
    },
    {
      icon: Package,
      iconColor: 'text-violet-500',
      bgColor: 'bg-violet-50',
      label: 'Çeşit',
      value: uniqueProducts,
      sub: 'ürün kayıtlı',
    },
    {
      icon: Bell,
      iconColor: criticalItems.length > 0 ? 'text-red-500' : 'text-emerald-500',
      bgColor: criticalItems.length > 0 ? 'bg-red-50' : 'bg-emerald-50',
      label: 'Kritik',
      value: criticalItems.length,
      sub: criticalItems.length > 0 ? 'düşük stok!' : 'sorun yok ✓',
      onClick: () => navigate('/alerts'),
      alert: criticalItems.length > 0,
    },
  ];

  return (
    <div className="px-4 pt-4 pb-32 space-y-5 max-w-lg mx-auto">

      {/* ── Greeting ─────────────────────────────────── */}
      <div className="animate-fade-in-up">
        <p className="text-sm text-slate-500 font-medium">{greeting},</p>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5 tracking-tight">{user?.name}</h1>
        {activeLocation && (
          <div className="flex items-center gap-1.5 mt-2 bg-emerald-50 rounded-xl px-3 py-1.5 w-fit">
            <span className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse flex-shrink-0"></span>
            <span className="text-sm text-emerald-700 font-semibold">{activeLocation.name}</span>
            {activeLocation.type !== 'all' && (
              <>
                <span className="text-emerald-400">·</span>
                <span className="text-xs text-emerald-600">{activeLocation.type === 'warehouse' ? 'Depo' : 'Mağaza'}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── KPI Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 animate-fade-in-up delay-75">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          const CardEl = card.onClick ? 'button' : 'div';
          return (
            <CardEl
              key={i}
              onClick={card.onClick}
              className={`bg-white rounded-2xl p-4 card-shadow border transition-all text-left ${
                card.alert
                  ? 'border-red-200 bg-red-50/50 active:scale-95'
                  : 'border-slate-100/80 active:scale-95'
              } ${card.onClick ? 'cursor-pointer' : ''}`}
            >
              <div className={`h-8 w-8 rounded-xl ${card.bgColor} flex items-center justify-center mb-2.5`}>
                <Icon size={16} className={card.iconColor} />
              </div>
              <div className={`text-2xl font-black leading-none tracking-tight ${card.alert ? 'text-red-600' : 'text-slate-800'}`}>
                {card.value}
              </div>
              <div className={`text-[11px] font-medium mt-1 ${card.alert ? 'text-red-500' : 'text-slate-400'}`}>
                {card.sub}
              </div>
            </CardEl>
          );
        })}
      </div>

      {/* ── Quick Actions ─────────────────────────────── */}
      <div className="animate-fade-in-up delay-100">
        <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <Zap size={14} className="text-primary-500" />
          Hızlı İşlemler
        </h2>
        <div className={`grid gap-2.5 ${quickActions.length <= 3 ? 'grid-cols-3' : 'grid-cols-3'}`}>
          {quickActions.map(({ to, icon: Icon, label, gradient, shadow }, i) => (
            <Link
              key={to}
              to={to}
              className={`touch-active bg-white p-3 rounded-2xl border border-slate-100/80 card-shadow flex flex-col items-center gap-2.5`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} shadow-lg ${shadow} flex items-center justify-center`}>
                <Icon size={22} className="text-white" strokeWidth={1.8} />
              </div>
              <span className="text-xs font-semibold text-slate-700 text-center leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Stock Distribution ───────────────────────── */}
      {topProducts.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100/80 card-shadow p-4 animate-fade-in-up delay-150">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-primary-500" />
              <h2 className="text-sm font-bold text-slate-800">Stok Dağılımı</h2>
            </div>
            <button
              onClick={() => navigate('/inventory')}
              className="flex items-center gap-1 text-xs text-primary-600 font-semibold bg-primary-50 px-2.5 py-1 rounded-lg hover:bg-primary-100 transition-colors"
            >
              Tümü <ChevronRight size={13} />
            </button>
          </div>

          <div className="space-y-3.5">
            {topProducts.map((item, i) => {
              const pct = Math.round((item.quantity / maxQty) * 100);
              const isCritical = item.quantity <= 0;
              return (
                <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-semibold text-slate-700 truncate max-w-[60%]">{item.productName}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold ${isCritical ? 'text-red-600' : 'text-slate-700'}`}>{item.quantity}</span>
                      {isCritical && (
                        <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-black">DÜŞÜK</span>
                      )}
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        isCritical
                          ? 'bg-gradient-to-r from-red-400 to-red-500'
                          : 'bg-gradient-to-r from-primary-400 to-primary-500'
                      }`}
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
      <div className="bg-white rounded-2xl border border-slate-100/80 card-shadow p-4 animate-fade-in-up delay-200">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-emerald-500" />
          <h2 className="text-sm font-bold text-slate-800">Bugünkü Aktivite</h2>
          {todayTransfers.length > 0 && (
            <span className="ml-auto text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {todayTransfers.length} işlem
            </span>
          )}
        </div>

        {todayTransfers.length === 0 ? (
          <div className="flex items-center gap-3 py-2">
            <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
              <Activity size={18} className="text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600">Bugün işlem yapılmadı</p>
              <p className="text-xs text-slate-400 mt-0.5">Transfer veya sayım başlatın</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {todayTransfers.slice(-3).reverse().map(t => (
              <div key={t.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="h-9 w-9 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center shrink-0">
                  <ArrowRightLeft size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">{t.from} → {t.to}</p>
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
      <div className="bg-white rounded-2xl border border-slate-100/80 card-shadow p-4 animate-fade-in-up delay-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-blue-500" />
            <h2 className="text-sm font-bold text-slate-800">Lokasyonlar</h2>
          </div>
          {perms.canManageLocations && (
            <button
              onClick={() => navigate('/admin/locations')}
              className="flex items-center gap-1 text-xs text-primary-600 font-semibold bg-primary-50 px-2.5 py-1 rounded-lg hover:bg-primary-100 transition-colors"
            >
              Yönet <ChevronRight size={13} />
            </button>
          )}
        </div>

        <div className="space-y-2">
          {(!perms.canAccessAdmin && user?.activeLocationId !== 'all') ? null : (
            <div
              onClick={() => perms.canAccessAdmin && handleLocationClick('all')}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${perms.canAccessAdmin ? 'cursor-pointer' : ''} ${
                user?.activeLocationId === 'all'
                  ? 'bg-primary-50 border-primary-200'
                  : 'bg-slate-50 border-transparent hover:border-slate-200 hover:bg-slate-100'
              }`}
            >
            <div className="flex items-center gap-2.5">
              <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                user?.activeLocationId === 'all' ? 'bg-primary-600 text-white shadow-md shadow-primary-400/30' : 'bg-white text-slate-600 border border-slate-200'
              }`}>
                <Layers size={16} />
              </div>
              <div>
                <p className={`text-sm font-bold leading-none ${user?.activeLocationId === 'all' ? 'text-primary-700' : 'text-slate-700'}`}>Tüm Lokasyonlar</p>
                <p className="text-[10px] text-slate-400 mt-0.5 capitalize">Genel Bakış</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-right">
              <div>
                <p className="text-sm font-extrabold text-slate-700">{inventory.reduce((s, i) => s + i.quantity, 0).toLocaleString('tr-TR')}</p>
                <p className="text-[10px] text-slate-400">toplam adet</p>
              </div>
              {inventory.filter(i => i.quantity <= 0).length > 0 && (
                <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-1 rounded-lg font-black">{inventory.filter(i => i.quantity <= 0).length} ⚠</span>
              )}
            </div>
          </div>
          )}

          {locations.filter(l => l.status === 'active' && (perms.canAccessAdmin || user?.activeLocationId === 'all' || l.id === user?.activeLocationId)).map(loc => {
            const locInv = inventory.filter(i => i.locationId === loc.id);
            const locTotal = locInv.reduce((s, i) => s + i.quantity, 0);
            const locCritical = locInv.filter(i => i.quantity <= 0).length;
            const isActive = loc.id === user?.activeLocationId;

            return (
              <div
                key={loc.id}
                onClick={() => perms.canAccessAdmin && handleLocationClick(loc.id)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${perms.canAccessAdmin ? 'cursor-pointer' : ''} ${
                  isActive
                    ? 'bg-primary-50 border-primary-200'
                    : 'bg-slate-50 border-transparent hover:border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                    isActive ? 'bg-primary-600 text-white shadow-md shadow-primary-400/30' : 'bg-white text-slate-600 border border-slate-200'
                  }`}>
                    {loc.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className={`text-sm font-bold leading-none ${isActive ? 'text-primary-700' : 'text-slate-700'}`}>{loc.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 capitalize">{loc.type === 'warehouse' ? '📦 Depo' : '🏪 Mağaza'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <div>
                    <p className="text-sm font-extrabold text-slate-700">{locTotal.toLocaleString('tr-TR')}</p>
                    <p className="text-[10px] text-slate-400">adet</p>
                  </div>
                  {locCritical > 0 && (
                    <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-1 rounded-lg font-black">{locCritical} ⚠</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
