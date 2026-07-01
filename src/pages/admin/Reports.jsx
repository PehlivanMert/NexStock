import { useState } from 'react';
import { FileText, Download, Calendar, BarChart2, X, Loader2, Plus, ChevronDown, CheckCircle2 } from 'lucide-react';
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
  const countLogs = useStore(state => state.countLogs || []);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [generating, setGenerating] = useState(null);
  const [reports, setReports] = useState(DEFAULT_REPORTS);
  const [generatedHistory, setGeneratedHistory] = useState({});
  const [expandedKey, setExpandedKey] = useState(null);

  const [selectedLogIds, setSelectedLogIds] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  
  const user = useStore(state => state.user);
  const deleteLogsStore = useStore(state => state.deleteLogs);
  const ROLE_PERMISSIONS = useStore(state => state.ROLE_PERMISSIONS) || { admin: { canAccessAdmin: true }, manager: { canAccessAdmin: true } };
  const perms = ROLE_PERMISSIONS[user?.role] || {};

  const handleToggleSelectLog = (id) => {
    const newSel = new Set(selectedLogIds);
    if (newSel.has(id)) newSel.delete(id);
    else newSel.add(id);
    setSelectedLogIds(newSel);
  };

  const handleSelectAllLogs = () => {
    if (selectedLogIds.size === countLogs.length && countLogs.length > 0) {
      setSelectedLogIds(new Set());
    } else {
      setSelectedLogIds(new Set(countLogs.map(l => l.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (!perms.canAccessAdmin) return;
    if (!window.confirm(`Seçili ${selectedLogIds.size} sayım raporunu kalıcı olarak silmek istediğinize emin misiniz?`)) return;

    setDeleting(true);
    try {
      const itemsToDelete = [];
      const updatedCountLogs = [...countLogs];
      
      selectedLogIds.forEach(id => {
        itemsToDelete.push({ collectionName: 'countLogs', id });
        const idx = updatedCountLogs.findIndex(c => c.id === id);
        if (idx !== -1) updatedCountLogs.splice(idx, 1);
      });

      await deleteLogsStore({ countLogs: updatedCountLogs }, itemsToDelete);
      
      toast.success(`${selectedLogIds.size} sayım raporu silindi.`);
      setSelectedLogIds(new Set());
    } catch (err) {
      toast.error("Silme başarısız: " + err.message);
    }
    setDeleting(false);
  };

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
        
        const rows = [];
        filtered.forEach(t => {
          if (t.items && t.items.length > 0) {
            t.items.forEach(item => {
              rows.push({
                'Tarih': new Date(t.date).toLocaleDateString('tr-TR'),
                'Saat': new Date(t.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                'Çıkış Lokasyonu': t.from,
                'Giriş Lokasyonu': t.to,
                'İşlem Yapan': t.user || '-',
                'Ürün Adı': item.name || item.productName || '-',
                'Miktar': item.quantity || 0,
                'SKU / Barkod': item.sku || item.barcode || '-',
              });
            });
          } else {
            rows.push({
              'Tarih': new Date(t.date).toLocaleDateString('tr-TR'),
              'Saat': new Date(t.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
              'Çıkış Lokasyonu': t.from,
              'Giriş Lokasyonu': t.to,
              'İşlem Yapan': t.user || '-',
              'Ürün Adı': 'Detay Yok',
              'Miktar': t.itemCount || t.items?.length || '-',
              'SKU / Barkod': '-',
            });
          }
        });
        return rows;
      }
      case 'count_diff': {
        const filteredCounts = dateRange.start
          ? countLogs.filter(c => {
              const d = new Date(c.date);
              return d >= new Date(dateRange.start) && d <= new Date(dateRange.end + 'T23:59:59');
            })
          : countLogs;

        if (filteredCounts.length === 0) return [{ 'Hata': 'Bu tarih aralığında sayım raporu bulunamadı.' }];

        const rows = [];
        filteredCounts.forEach(log => {
          log.items.forEach(item => {
            rows.push({
              'Sayım ID': log.id,
              'Tarih': new Date(log.date).toLocaleDateString('tr-TR'),
              'Lokasyon': log.locationName,
              'Ürün Adı': item.name,
              'SKU': item.sku,
              'Sistem Stoku': item.expected,
              'Sayılan Miktar': item.counted,
              'Fark': item.counted - item.expected,
              'Durum': item.counted === item.expected ? 'Eşit' : (item.counted > item.expected ? 'Fazla' : 'Eksik'),
            });
          });
        });
        return rows;
      }
      case 'low_stock':
        return buildInventoryRows().filter(r => r['Stok Miktarı'] < 20)
          .map(r => ({ ...r, 'Uyarı Seviyesi': r['Stok Miktarı'] < 5 ? 'KRİTİK' : 'DÜŞÜK' }));
      case 'staff_perf':
        return users.map(u => {
          const userCounts = countLogs.filter(c => c.user === u.name || c.userName === u.name);
          const totalDiscrepancies = userCounts.reduce((acc, c) => acc + (c.discrepancies || 0), 0);
          return {
            'Personel': u.name,
            'E-posta': u.email,
            'Rol': u.role,
            'Sorumlu Lokasyon': u.location,
            'Transfer Sayısı': transferLog.filter(t => t.user === u.name).length,
            'Sayım Raporu Sayısı': userCounts.length,
            'Toplam Sayım Uyuşmazlığı': totalDiscrepancies,
            'Durum': u.status,
          };
        });
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
    <div className="space-y-7 animate-fade-in">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Raporlar ve Analizler</h1>
          <p className="text-slate-500 mt-1 text-sm">Sistem verilerini dışa aktarın ve geçmiş kayıtları inceleyin.</p>
        </div>
        <button
          onClick={() => setShowDatePicker(v => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold border transition-colors text-sm ${
            showDatePicker
              ? 'bg-primary-50 border-primary-300 text-primary-700'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Calendar size={17} />
          Tarih Aralığı
          {dateRange.start && <span className="text-[10px] bg-primary-500 text-white px-1.5 py-0.5 rounded-full font-black">✓</span>}
        </button>
      </div>

      {/* ── Date Picker ──────────────────────────────────── */}
      {showDatePicker && (
        <div className="bg-white border border-slate-200/80 rounded-2xl card-shadow p-5 animate-scale-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800">Tarih Aralığı Filtresi</h3>
            <button onClick={() => setShowDatePicker(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {[
              { label: 'Başlangıç', field: 'start' },
              { label: 'Bitiş', field: 'end' },
            ].map(f => (
              <div key={f.field}>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">{f.label}</label>
                <input
                  type="date" value={dateRange[f.field]}
                  onChange={e => setDateRange(d => ({ ...d, [f.field]: e.target.value }))}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none bg-slate-50 text-sm"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setDateRange({ start: '', end: '' }); setShowDatePicker(false); }}
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold text-sm"
            >
              Temizle
            </button>
            <button
              onClick={() => {
                if (!dateRange.start || !dateRange.end) { toast.error('Her iki tarihi de seçin.'); return; }
                if (new Date(dateRange.start) > new Date(dateRange.end)) { toast.error('Başlangıç tarihi bitiş tarihinden büyük olamaz.'); return; }
                toast.success('Tarih aralığı uygulandı!', { description: `${dateRange.start} – ${dateRange.end}` });
                setShowDatePicker(false);
              }}
              className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold text-sm"
            >
              Uygula
            </button>
          </div>
        </div>
      )}

      {/* ── Report Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reports.map((report) => {
          const history = generatedHistory[report.id] || [];
          const lastGen = history[history.length - 1];
          const isExpanded = expandedKey === report.id;

          return (
            <div key={report.id} className="bg-white rounded-2xl border border-slate-200/80 card-shadow overflow-hidden hover:border-slate-300 transition-all">
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="text-4xl shrink-0">{report.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-slate-800 leading-tight">{report.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{report.desc}</p>
                  </div>
                </div>

                {dateRange.start && (
                  <div className="text-xs text-primary-600 font-semibold bg-primary-50 px-2.5 py-1.5 rounded-xl inline-flex items-center gap-1.5 mt-3">
                    📅 {dateRange.start} – {dateRange.end}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-400">
                    {lastGen ? `Son: ${lastGen.date}` : 'Henüz oluşturulmadı'}
                  </div>
                  <button
                    onClick={() => handleDownload(report)}
                    disabled={generating === report.id}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                      generating === report.id
                        ? 'bg-slate-100 text-slate-400'
                        : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                    }`}
                  >
                    {generating === report.id
                      ? <><Loader2 size={14} className="animate-spin" /> Hazırlanıyor...</>
                      : <><Download size={14} /> Excel İndir</>
                    }
                  </button>
                </div>
              </div>

              {/* History accordion */}
              {history.length > 0 && (
                <div className="border-t border-slate-100">
                  <button
                    onClick={() => setExpandedKey(isExpanded ? null : report.id)}
                    className="w-full px-5 py-2.5 text-left text-xs font-semibold text-slate-500 hover:bg-slate-50 flex items-center justify-between transition-colors"
                  >
                    <span>Geçmiş İndirmeler ({history.length})</span>
                    <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  {isExpanded && (
                    <div className="px-5 pb-4 space-y-2">
                      {history.slice().reverse().map((h, i) => (
                        <div key={i} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg">
                          <div>
                            <div className="font-semibold text-slate-700">{h.date}</div>
                            <div className="text-slate-400 font-mono truncate max-w-[180px]">{h.file}.xlsx</div>
                          </div>
                          <span className="text-primary-600 font-bold text-[10px] bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-full">{h.range}</span>
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

      {/* ── Count Logs ─────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="text-emerald-500" size={20} />
          <h2 className="text-lg font-bold text-slate-800">Son Sayım Raporları</h2>
          {countLogs.length > 0 && (
            <>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">{countLogs.length} rapor</span>
              <button
                onClick={() => {
                  const rows = [];
                  countLogs.forEach(log => {
                    log.items.forEach(item => {
                      rows.push({
                        'Sayım ID': log.id.slice(-6),
                        'Tarih': new Date(log.date).toLocaleDateString('tr-TR'),
                        'Lokasyon': log.locationName,
                        'Ürün Adı': item.name,
                        'SKU': item.sku,
                        'Sistem Stoku': item.expected,
                        'Sayılan': item.counted,
                        'Fark': item.counted - item.expected,
                        'Durum': item.counted === item.expected ? 'Eşit' : item.counted > item.expected ? 'Fazla' : 'Eksik',
                      });
                    });
                  });
                  const ws = XLSX.utils.json_to_sheet(rows);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, 'Sayım Raporları');
                  XLSX.writeFile(wb, `NexStock_Tum_Sayimlar_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '-')}.xlsx`);
                  toast.success('Tüm sayımlar Excel\'e aktarıldı!');
                }}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-xl text-xs font-bold transition-colors"
              >
                <Download size={13} /> Tümünü İndir
              </button>
            </>
          )}
        </div>
        
        {countLogs.length > 0 && perms.canAccessAdmin && (
          <div className="flex items-center gap-3 mb-6 bg-white p-3 rounded-xl border border-slate-200 card-shadow">
            <button
              onClick={handleSelectAllLogs}
              className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors"
            >
              {selectedLogIds.size === countLogs.length ? 'Seçimi Temizle' : 'Tümünü Seç'}
            </button>
            {selectedLogIds.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                disabled={deleting}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
              >
                {deleting ? 'Siliniyor...' : `Seçilileri Sil (${selectedLogIds.size})`}
              </button>
            )}
          </div>
        )}

        {countLogs.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 text-center card-shadow">
            <div className="h-14 w-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText size={24} className="text-slate-300" />
            </div>
            <p className="font-semibold text-slate-500">Henüz sayım raporu yok</p>
            <p className="text-sm text-slate-400 mt-1">El terminalinden "Rapor Kaydet" ile ilk sayımı oluşturun.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {countLogs.slice().reverse().map(log => (
              <div key={log.id} className="bg-white rounded-2xl border border-slate-200/80 card-shadow overflow-hidden relative">
                {perms.canAccessAdmin && (
                  <div className="absolute top-4 right-4 z-10">
                    <input
                      type="checkbox"
                      checked={selectedLogIds.has(log.id)}
                      onChange={() => handleToggleSelectLog(log.id)}
                      className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500 border-slate-300 cursor-pointer"
                    />
                  </div>
                )}
                <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-start pr-12">
                  <div>
                    <h3 className="font-bold text-slate-800">{log.locationName} Sayımı</h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {new Date(log.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg text-xs font-mono hidden sm:block">
                    #{log.id.slice(-6)}
                  </div>
                </div>

                <div className="px-5 py-3 flex gap-3">
                  <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                    <div className="text-xl font-black text-slate-800">{log.totalItems}</div>
                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">Çeşit</div>
                  </div>
                  <div className={`flex-1 rounded-xl p-3 text-center border ${log.discrepancies > 0 ? 'bg-orange-50 border-orange-100' : 'bg-emerald-50 border-emerald-100'}`}>
                    <div className={`text-xl font-black ${log.discrepancies > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>{log.discrepancies}</div>
                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">Uyuşmazlık</div>
                  </div>
                </div>

                <div className="px-5 pb-5 space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar">
                  {log.items.map((item, idx) => {
                    const diff = item.counted - item.expected;
                    return (
                      <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/80 hover:bg-slate-50 hover:shadow-sm transition-all">
                        <div className="min-w-0 flex-1 pr-4">
                          <div className="text-[15px] font-bold text-slate-700 truncate mb-1">{item.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono tracking-wider">{item.sku}</div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0 text-center">
                          <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-0.5">Sistem</div>
                            <div className="text-[15px] font-bold text-slate-600">{item.expected}</div>
                          </div>
                          <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-0.5">Sayılan</div>
                            <div className="text-[15px] font-black text-slate-800">{item.counted}</div>
                          </div>
                          <div className={`px-3 py-2 rounded-xl text-[15px] font-black border min-w-[50px] flex items-center justify-center ${diff === 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : diff > 0 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                            {diff > 0 ? `+${diff}` : diff}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
