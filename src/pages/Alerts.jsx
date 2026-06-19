import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, TrendingDown, Bell, CheckCircle, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function Alerts() {
  const navigate = useNavigate();
  const user = useStore(state => state.user);
  const inventory = useStore(state => state.inventory);
  const products = useStore(state => state.products);
  const transferLog = useStore(state => state.transferLog);

  const [dismissedAlerts, setDismissedAlerts] = useState(() => {
    try {
      const saved = localStorage.getItem('dismissedAlerts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('dismissedAlerts', JSON.stringify(dismissedAlerts));
  }, [dismissedAlerts]);

  const locationInventory = user?.activeLocationId === 'all'
    ? inventory
    : inventory.filter(i => i.locationId === user?.activeLocationId);

  const lowStockItems = locationInventory
    .filter(inv => inv.quantity < 10)
    .map(inv => ({
      id: `low-${inv.id}`,
      productName: products.find(p => p.id === inv.productId)?.name || 'Bilinmeyen',
      quantity: inv.quantity,
    }));

  const recentTransfers = transferLog
    .filter(t => new Date(t.date).toDateString() === new Date().toDateString())
    .map((t) => ({
      id: `trans-${t.id}`,
      type: 'info',
      title: 'Transfer İşlemi',
      desc: `${t.from} → ${t.to} · ${t.items?.length || 0} kalem`,
      time: new Date(t.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      icon: Clock,
      action: () => navigate('/admin/reports'),
      actionLabel: 'Raporlara Git',
    }));

  const allAlerts = [
    ...lowStockItems.map((item) => ({
      id: item.id,
      type: 'critical',
      title: 'Kritik Stok Uyarısı',
      desc: `${item.productName} — Mevcut: ${item.quantity} adet`,
      time: 'Sistem',
      icon: TrendingDown,
      action: () => navigate('/inventory'),
      actionLabel: 'Stoğu Gör',
    })),
    ...recentTransfers.reverse(),
  ];

  const alerts = allAlerts.filter(a => !dismissedAlerts.includes(a.id));

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Uyarılar</h1>
            {alerts.filter(a => a.type === 'critical').length > 0 && (
              <p className="text-sm text-red-600 font-semibold mt-0.5">
                {alerts.filter(a => a.type === 'critical').length} kritik stok uyarısı
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {dismissedAlerts.length > 0 && (
               <button onClick={() => setDismissedAlerts([])} className="text-xs text-slate-400 underline mr-2">Tümünü Geri Getir</button>
            )}
            {alerts.length > 0 && (
              <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                alerts.filter(a => a.type === 'critical').length > 0 ? 'bg-red-500' : 'bg-primary-500'
              }`}>
                <span className="text-white text-sm font-black">{alerts.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full -mt-8 animate-fade-in">
            <div className="h-20 w-20 bg-emerald-50 rounded-3xl flex items-center justify-center mb-5 shadow-lg shadow-emerald-100">
              <CheckCircle size={36} className="text-emerald-500" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Her şey yolunda!</h2>
            <p className="text-slate-400 text-sm mt-2 text-center max-w-xs">Aktif uyarı bulunmuyor. Stok seviyeleri normal.</p>
          </div>
        ) : (
          alerts.map((alert, i) => {
            const Icon = alert.icon;
            const isCritical = alert.type === 'critical';

            return (
              <div
                key={alert.id}
                className={`bg-white rounded-2xl card-shadow border flex overflow-hidden animate-fade-in-up relative ${
                  isCritical ? 'border-red-100' : 'border-slate-100/80'
                }`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Colored left bar */}
                <div className={`w-1 shrink-0 ${isCritical ? 'bg-red-500' : 'bg-blue-400'}`} />

                <div className="flex gap-3.5 p-4 flex-1 pr-10">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                    isCritical ? 'bg-red-50' : 'bg-blue-50'
                  }`}>
                    <Icon size={22} className={isCritical ? 'text-red-500' : 'text-blue-500'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-slate-800 text-sm">{alert.title}</h3>
                      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2 shrink-0">{alert.time}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5 leading-snug">{alert.desc}</p>
                    {alert.action && (
                      <button
                        onClick={alert.action}
                        className={`mt-2.5 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 w-fit ${
                          isCritical
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                        } transition-colors`}
                      >
                        {alert.actionLabel} <ChevronRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setDismissedAlerts(prev => [...prev, alert.id])}
                  className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  title="Sil"
                >
                  <X size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
