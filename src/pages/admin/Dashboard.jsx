import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { Package, MapPin, TrendingUp, AlertTriangle, ArrowRightLeft, Activity, Layers } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const inventory = useStore(state => state.inventory);
  const locations = useStore(state => state.locations);
  const transferLog = useStore(state => state.transferLog);
  const products = useStore(state => state.products);
  const navigate = useNavigate();

  const totalProducts = inventory.reduce((acc, curr) => acc + curr.quantity, 0);
  const activeLocationsCount = locations.filter(l => l.status === 'active').length;
  const criticalProductsCount = inventory.filter(i => i.quantity < 10).length;
  const totalTransfers = transferLog.length;

  const todayTransfers = transferLog.filter(t =>
    new Date(t.date).toDateString() === new Date().toDateString()
  ).length;

  // Last 7 days transfer chart
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toLocaleDateString('tr-TR', { weekday: 'short' });
    const dayDate = d.toDateString();
    const transfersThatDay = transferLog.filter(t => new Date(t.date).toDateString() === dayDate);
    return {
      name: dayStr,
      transfer: transfersThatDay.length,
      items: transfersThatDay.reduce((s, t) => s + (t.items?.length || 0), 0),
    };
  });

  const locationData = locations.map(loc => ({
    name: loc.name,
    stok: inventory.filter(i => i.locationId === loc.id).reduce((a, b) => a + b.quantity, 0),
    kritik: inventory.filter(i => i.locationId === loc.id && i.quantity < 10).length,
  }));

  const kpiCards = [
    {
      label: 'Toplam Stok',
      value: totalProducts.toLocaleString('tr-TR'),
      sub: 'adet ürün',
      icon: Layers,
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      trend: null,
    },
    {
      label: 'Aktif Lokasyon',
      value: activeLocationsCount,
      sub: 'tesis',
      icon: MapPin,
      gradient: 'from-violet-500 to-violet-600',
      bg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      trend: null,
    },
    {
      label: 'Toplam Transfer',
      value: totalTransfers,
      sub: `bugün ${todayTransfers} işlem`,
      icon: ArrowRightLeft,
      gradient: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      trend: null,
    },
    {
      label: 'Kritik Stok',
      value: criticalProductsCount,
      sub: criticalProductsCount > 0 ? 'acil müdahale' : 'sorun yok',
      icon: AlertTriangle,
      gradient: criticalProductsCount > 0 ? 'from-red-500 to-red-600' : 'from-slate-400 to-slate-500',
      bg: criticalProductsCount > 0 ? 'bg-red-50' : 'bg-slate-50',
      iconColor: criticalProductsCount > 0 ? 'text-red-600' : 'text-slate-400',
      alert: criticalProductsCount > 0,
      onClick: () => navigate('/admin/inventory'),
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-lg text-sm">
        <p className="font-bold text-slate-700 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-7 animate-fade-in">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Yönetim Özeti</h1>
          <p className="text-slate-500 mt-1 text-sm">Sistemin genel durumu ve anlık istatistikler.</p>
        </div>
        <div className="text-xs text-slate-400 bg-white border border-slate-200 rounded-xl px-3 py-2 hidden sm:block">
          {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          const El = card.onClick ? 'button' : 'div';
          return (
            <El
              key={i}
              onClick={card.onClick}
              className={`bg-white rounded-2xl p-5 border card-shadow text-left transition-all ${
                card.alert
                  ? 'border-red-200 hover:border-red-300 cursor-pointer hover:shadow-md'
                  : 'border-slate-200/80 hover:border-slate-300'
              } ${card.onClick ? 'cursor-pointer active:scale-98' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`h-11 w-11 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <Icon size={22} className={card.iconColor} />
                </div>
                {card.alert && (
                  <span className="text-[10px] font-black text-red-600 bg-red-100 px-2 py-0.5 rounded-full animate-pulse">
                    ACİL
                  </span>
                )}
              </div>
              <div className={`text-3xl font-black tracking-tight mb-1 ${card.alert ? 'text-red-600' : 'text-slate-800'}`}>
                {card.value}
              </div>
              <div className="text-sm font-semibold text-slate-600">{card.label}</div>
              <div className={`text-xs mt-0.5 ${card.alert ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                {card.sub}
              </div>
            </El>
          );
        })}
      </div>

      {/* ── Charts ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area chart - weekly transfers */}
        <div className="bg-white rounded-2xl border border-slate-200/80 card-shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-800">Haftalık Transfer Özeti</h2>
              <p className="text-xs text-slate-400 mt-0.5">Son 7 gün</p>
            </div>
            <div className="h-9 w-9 bg-emerald-50 rounded-xl flex items-center justify-center">
              <TrendingUp size={18} className="text-emerald-600" />
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="transferGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone" dataKey="transfer"
                  stroke="#10b981" strokeWidth={2.5}
                  fill="url(#transferGrad)"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#059669' }}
                  name="Transfer"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar chart - location stock */}
        <div className="bg-white rounded-2xl border border-slate-200/80 card-shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-800">Lokasyon Bazlı Stok</h2>
              <p className="text-xs text-slate-400 mt-0.5">Toplam adet dağılımı</p>
            </div>
            <div className="h-9 w-9 bg-violet-50 rounded-xl flex items-center justify-center">
              <Package size={18} className="text-violet-600" />
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="stok" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Stok" maxBarSize={48} />
                <Bar dataKey="kritik" fill="#fca5a5" radius={[8, 8, 0, 0]} name="Kritik" maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Recent Transfers ─────────────────────────────── */}
      {transferLog.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 card-shadow">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-primary-500" />
              <h2 className="font-bold text-slate-800">Son Transfer Hareketleri</h2>
            </div>
            <button
              onClick={() => navigate('/admin/reports')}
              className="text-xs text-primary-600 font-semibold bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              Tümünü Gör →
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {transferLog.slice(-5).reverse().map((t, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <div className="h-9 w-9 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
                  <ArrowRightLeft size={16} className="text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700 truncate">{t.from}</span>
                    <span className="text-slate-300 text-xs">→</span>
                    <span className="text-sm font-semibold text-slate-700 truncate">{t.to}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{t.user || 'Sistem'} · {t.items?.length || 0} ürün</div>
                </div>
                <div className="text-xs text-slate-400 shrink-0">
                  {new Date(t.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
