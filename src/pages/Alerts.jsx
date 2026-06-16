import { AlertTriangle, Clock, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function Alerts() {
  const navigate = useNavigate();
  const user = useStore(state => state.user);
  const inventory = useStore(state => state.inventory);
  const products = useStore(state => state.products);
  const transferLog = useStore(state => state.transferLog);

  // Filter for active location
  const locationInventory = inventory.filter(i => i.locationId === user?.activeLocationId);

  // Generate real alerts from inventory data
  const lowStockItems = locationInventory
    .filter(inv => inv.quantity < 10)
    .map(inv => ({
      productName: products.find(p => p.id === inv.productId)?.name || 'Bilinmeyen',
      quantity: inv.quantity,
    }));

  const recentTransfers = transferLog
    .filter(t => new Date(t.date).toDateString() === new Date().toDateString())
    .map((t, i) => ({
      id: `trans-${i}`,
      type: 'info',
      title: 'Yeni Transfer İşlemi',
      desc: `${t.user || 'Bir personel'} tarafından ${t.from} konumundan ${t.to} konumuna ${t.items?.length || 0} kalem ürün transfer edildi.`,
      time: new Date(t.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      icon: Clock,
      action: () => navigate('/admin/reports'),
      actionLabel: 'Raporlara Git',
    }));

  const alerts = [
    ...lowStockItems.map((item, i) => ({
      id: `low-${i}`,
      type: 'critical',
      title: 'Kritik Stok Uyarısı',
      desc: `${item.productName} stokları kritik seviyede. (Mevcut: ${item.quantity})`,
      time: 'Sistem',
      icon: TrendingDown,
      action: () => navigate('/admin/inventory'),
      actionLabel: 'Stokları Gör',
    })),
    ...recentTransfers.reverse()
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white px-4 py-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-800">Uyarılar ve Bildirimler</h1>
        {lowStockItems.length > 0 && (
          <p className="text-sm text-red-600 font-medium mt-1">⚠ {lowStockItems.length} kritik stok uyarısı var</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {alerts.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <div className="text-4xl mb-3">✅</div>
            <p className="font-medium">Aktif uyarı bulunmuyor.</p>
          </div>
        )}
        {alerts.map((alert) => {
          const Icon = alert.icon;
          const isCritical = alert.type === 'critical';
          const isWarning = alert.type === 'warning';

          return (
            <div key={alert.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${
                isCritical ? 'bg-red-100 text-red-600' :
                isWarning ? 'bg-orange-100 text-orange-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                <Icon size={24} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-800">{alert.title}</h3>
                  <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">{alert.time}</span>
                </div>
                <p className="text-sm text-slate-600 leading-snug">{alert.desc}</p>
                {(isCritical || isWarning) && (
                  <button
                    onClick={alert.action}
                    className="mt-3 text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    {alert.actionLabel || 'Hemen Aksiyon Al'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
