import { useState, useMemo } from 'react';
import { FileText, Download, Calendar, BarChart2, X, Loader2, Plus, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../../store/useStore';
import * as XLSX from 'xlsx';

const DEFAULT_REPORTS = [
  { id: 1, key: 'weekly_stock', name: 'Haftalık Stok Hareketleri', desc: 'Son 7 gündeki tüm giriş-çıkış ve transfer kayıtları.', icon: '📦' },
  { id: 2, key: 'count_diff', name: 'Sayım Farklılıkları Raporu', desc: 'Sistem stoku ile personel sayımları arasındaki uyuşmazlıklar.', icon: '🔍' },
  { id: 3, key: 'low_stock', name: 'Düşük Stok (Kritik) Uyarıları', desc: 'Asgari seviyenin altına düşen ürünler listesi.', icon: '⚠️' },
  { id: 4, key: 'staff_perf', name: 'Personel Performans Raporu', desc: 'Kullanıcıların okuttuğu barkod ve işlem sayıları.', icon: '👤' },
];

export default function Reports() {
  const inventory = useStore(state => state.inventory);
  const products = useStore(state => state.products);
  const locations = useStore(state => state.locations);
  const users = useStore(state => state.users);
  const transferLog = useStore(state => state.transferLog);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [generating, setGenerating] = useState(null);
  const [reports, setReports] = useState(DEFAULT_REPORTS);
  const [generatedHistory, setGeneratedHistory] = useState({});
  const [expandedKey, setExpandedKey] = useState(null);

  // Build inventory data (optionally filtered by date range - for transfer log)
  const buildInventoryRows = () =>
    inventory.map(inv => {
      const p = products.find(x => x.id === inv.productId);
      const l = locations.find(x => x.id === inv.locationId);
      return {
        'Ürün Adı': p?.name || '-',
        'SKU': p?.sku || '-',
        'Barkod': p?.barcode || '-',
        'Lokasyon': l?.name || '-',
        'Raf / Bölüm': inv.shelf || '-',
        'Stok Miktarı': inv.quantity,
        ...(dateRange.start ? { 'Rapor Başlangıcı': dateRange.start, 'Rapor Bitişi': dateRange.end } : {}),
        'Rapor Tarihi': new Date().toLocaleDateString('tr-TR'),
      };
    });

  const buildDataForReport = (reportKey) => {
    switch (reportKey) {
      case 'weekly_stock': {
        // Show transfer log filtered by date if set
        const filtered = dateRange.start
          ? transferLog.filter(t => {
              const d = new Date(t.date);
              return d >= new Date(dateRange.start) && d <= new Date(dateRange.end + 'T23:59:59');
            })
          : transferLog;

        if (filtered.length === 0) return buildInventoryRows();
        return filtered.map(t => ({
          'Tarih': new Date(t.date).toLocaleDateString('tr-TR'),
          'Saat': new Date(t.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          'Çıkış Lokasyonu': t.from,
          'Giriş Lokasyonu': t.to,
          'İşlem Yapan': t.user || '-',
          'Ürün Sayısı': t.items?.length || '-',
        }));
      }
      case 'count_diff':
        return buildInventoryRows().map(row => ({
          ...row,
          'Son Sayım Tarihi': '-',
          'Sayılan Miktar': '-',
          'Fark': '-'
        }));
      case 'low_stock':
        return buildInventoryRows().filter(r => r['Stok Miktarı'] < 20)
          .map(r => ({ ...r, 'Uyarı Seviyesi': r['Stok Miktarı'] < 5 ? 'KRİTİK' : 'DÜŞÜK' }));
      case 'staff_perf':
        return users.map(u => ({
          'Personel': u.name,
          'E-posta': u.email,
          'Rol': u.role,
          'Sorumlu Lokasyon': u.location,
          'Transfer Sayısı': transferLog.filter(t => t.user === u.name).length,
          'Durum': u.status,
        }));
      default:
        return buildInventoryRows();
    }
  };

  const makeFileName = (reportName) => {
    const clean = reportName.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ0-9 ]/g, '').replace(/ +/g, '_');
    const dateStr = dateRange.start
      ? `${dateRange.start}_${dateRange.end}`
      : new Date().toLocaleDateString('tr-TR').replace(/\./g, '-');
    return `NexStock_${clean}_${dateStr}`;
  };

  const handleDownload = (report) => {
    setGenerating(report.id);
    setTimeout(() => {
      const data = buildDataForReport(report.key || 'weekly_stock');
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, report.name.slice(0, 31));
      const fileName = makeFileName(report.name);
      XLSX.writeFile(wb, `${fileName}.xlsx`);

      const now = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      setGeneratedHistory(prev => ({
        ...prev,
        [report.id]: [...(prev[report.id] || []), { date: now, file: fileName, range: dateRange.start ? `${dateRange.start} – ${dateRange.end}` : 'Tüm Zamanlar' }],
      }));
      setGenerating(null);
      toast.success('Rapor indirildi!', { description: `${fileName}.xlsx` });
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Raporlar ve Analizler</h1>
          <p className="text-slate-500 mt-1">Sistem verilerini dışa aktarın ve geçmiş kayıtları inceleyin.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDatePicker(v => !v)}
            className={`border px-4 py-2.5 rounded-xl font-medium shadow-sm flex items-center gap-2 transition-colors ${showDatePicker ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
          >
            <Calendar size={18} />
            Tarih Aralığı
            {dateRange.start && <span className="text-[10px] bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded font-bold">✓</span>}
          </button>
        </div>
      </div>

      {/* Date Picker */}
      {showDatePicker && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800">Tarih Aralığı Filtresi</h3>
            <button onClick={() => setShowDatePicker(false)} className="p-1 text-slate-400 hover:text-slate-600"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Başlangıç</label>
              <input type="date" value={dateRange.start} onChange={e => setDateRange(d => ({ ...d, start: e.target.value }))}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bitiş</label>
              <input type="date" value={dateRange.end} onChange={e => setDateRange(d => ({ ...d, end: e.target.value }))}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setDateRange({ start: '', end: '' }); setShowDatePicker(false); }}
              className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium">
              Temizle
            </button>
            <button onClick={() => {
              if (!dateRange.start || !dateRange.end) { toast.error('Her iki tarihi de seçin.'); return; }
              if (new Date(dateRange.start) > new Date(dateRange.end)) { toast.error('Başlangıç tarihi bitiş tarihinden büyük olamaz.'); return; }
              toast.success('Tarih aralığı uygulandı!', { description: `${dateRange.start} – ${dateRange.end}` });
              setShowDatePicker(false);
            }} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
              Uygula
            </button>
          </div>
        </div>
      )}

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reports.map((report) => {
          const history = generatedHistory[report.id] || [];
          const lastGen = history[history.length - 1];
          const isExpanded = expandedKey === report.id;

          return (
            <div key={report.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5">
                <div className="text-3xl mb-3">{report.icon}</div>
                <h3 className="font-bold text-base text-slate-800 mb-1">{report.name}</h3>
                <p className="text-sm text-slate-500 mb-3">{report.desc}</p>

                {dateRange.start && (
                  <div className="text-xs text-primary-600 font-medium bg-primary-50 px-2.5 py-1 rounded-lg inline-block mb-3">
                    📅 {dateRange.start} – {dateRange.end}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-400">
                    {lastGen ? `Son: ${lastGen.date}` : 'Henüz oluşturulmadı'}
                  </div>
                  <button
                    onClick={() => handleDownload(report)}
                    disabled={generating === report.id}
                    className="text-primary-600 font-semibold text-sm flex items-center gap-1.5 hover:text-primary-700 disabled:opacity-50"
                  >
                    {generating === report.id
                      ? <><Loader2 size={15} className="animate-spin" /> Hazırlanıyor...</>
                      : <><Download size={15} /> Excel İndir</>
                    }
                  </button>
                </div>
              </div>

              {/* History accordion */}
              {history.length > 0 && (
                <div className="border-t border-slate-100">
                  <button onClick={() => setExpandedKey(isExpanded ? null : report.id)}
                    className="w-full px-5 py-2.5 text-left text-xs font-medium text-slate-500 hover:bg-slate-50 flex items-center justify-between">
                    <span>Geçmiş İndirmeler ({history.length})</span>
                    <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  {isExpanded && (
                    <div className="px-5 pb-4 space-y-2">
                      {history.slice().reverse().map((h, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <div>
                            <div className="font-medium text-slate-700">{h.date}</div>
                            <div className="text-slate-400 font-mono truncate max-w-[180px]">{h.file}.xlsx</div>
                          </div>
                          <span className="text-primary-500 font-medium text-[10px] bg-primary-50 px-2 py-0.5 rounded">{h.range}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
