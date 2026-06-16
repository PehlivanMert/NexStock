import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Package, MapPin, TrendingUp, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function AdminDashboard() {
  const inventory = useStore(state => state.inventory);
  const locations = useStore(state => state.locations);
  const transferLog = useStore(state => state.transferLog);

  const totalProducts = inventory.reduce((acc, curr) => acc + curr.quantity, 0);
  const activeLocationsCount = locations.filter(l => l.status === 'active').length;
  const criticalProductsCount = inventory.filter(i => i.quantity < 10).length;
  const totalTransfers = transferLog.reduce((acc, curr) => acc + (curr.items?.length || 0), 0);

  // Get last 7 days of transfers
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toLocaleDateString('tr-TR', { weekday: 'short' });
    const dayDate = d.toDateString();
    
    const transfersThatDay = transferLog.filter(t => new Date(t.date).toDateString() === dayDate);
    const transferCount = transfersThatDay.reduce((sum, t) => sum + (t.items?.length || 0), 0);
    
    return { name: dayStr, transfer: transferCount };
  });

  const locationData = locations.map(loc => ({
    name: loc.name,
    stok: inventory.filter(i => i.locationId === loc.id).reduce((a, b) => a + b.quantity, 0)
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Yönetim Özeti</h1>
          <p className="text-slate-500 mt-1">Sisteminizin genel durumu ve istatistikler.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package size={24} />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Toplam Stok</div>
            <div className="text-2xl font-bold text-slate-800">{totalProducts} Adet</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
            <MapPin size={24} />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Aktif Lokasyon</div>
            <div className="text-2xl font-bold text-slate-800">{activeLocationsCount} Tesis</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Toplam Hareket</div>
            <div className="text-2xl font-bold text-slate-800">{totalTransfers}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Kritik Stoklar</div>
            <div className="text-2xl font-bold text-slate-800">{criticalProductsCount} Ürün</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Haftalık Hareket Özeti</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last7Days} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <Line type="monotone" dataKey="transfer" stroke="#10b981" strokeWidth={3} name="Depo Transferi" />
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="5 5" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Lokasyon Bazlı Stok Dağılımı</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="5 5" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="stok" fill="#6366f1" radius={[6, 6, 0, 0]} name="Toplam Adet" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
