import React, { useState, useEffect } from 'react';
import { Activity, Filter, RefreshCw, User, Package, ArrowRightLeft, ClipboardList, Plus, Trash2, Edit2, Users, MapPin, Upload, Search } from 'lucide-react';
import { loadActivityLog } from '../../lib/firestoreService';
import { useStore } from '../../store/useStore';
import { toast } from 'sonner';

const ACTION_CONFIG = {
  ADD_PRODUCT: { label: 'Ürün Eklendi', icon: Plus, color: 'text-emerald-600', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
  EDIT_PRODUCT: { label: 'Ürün Düzenlendi', icon: Edit2, color: 'text-blue-600', bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
  DELETE_PRODUCT: { label: 'Ürün Silindi', icon: Trash2, color: 'text-red-600', bg: 'bg-red-50', badge: 'bg-red-100 text-red-700' },
  TRANSFER: { label: 'Transfer', icon: ArrowRightLeft, color: 'text-violet-600', bg: 'bg-violet-50', badge: 'bg-violet-100 text-violet-700' },
  COUNT: { label: 'Sayım', icon: ClipboardList, color: 'text-amber-600', bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700' },
  BULK_IMPORT: { label: 'Toplu Aktarım', icon: Upload, color: 'text-indigo-600', bg: 'bg-indigo-50', badge: 'bg-indigo-100 text-indigo-700' },
  ADD_USER: { label: 'Kullanıcı Eklendi', icon: User, color: 'text-teal-600', bg: 'bg-teal-50', badge: 'bg-teal-100 text-teal-700' },
  EDIT_USER: { label: 'Kullanıcı Düzenlendi', icon: User, color: 'text-blue-600', bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
  DELETE_USER: { label: 'Kullanıcı Silindi', icon: User, color: 'text-red-600', bg: 'bg-red-50', badge: 'bg-red-100 text-red-700' },
  ADD_LOCATION: { label: 'Lokasyon Eklendi', icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
  EDIT_LOCATION: { label: 'Lokasyon Düzenlendi', icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
  DELETE_LOCATION: { label: 'Lokasyon Silindi', icon: MapPin, color: 'text-red-600', bg: 'bg-red-50', badge: 'bg-red-100 text-red-700' },
};

function formatDetails(action, details) {
  switch (action) {
    case 'ADD_PRODUCT':
      return `${details.productName || '?'} · Miktar: ${details.quantity || 0}`;
    case 'EDIT_PRODUCT':
      return details.productName || details.invId || '?';
    case 'DELETE_PRODUCT':
      return details.productName || details.invId || '?';
    case 'TRANSFER':
      return `${details.from} → ${details.to} · ${details.itemCount || 0} kalem`;
    case 'COUNT':
      return `${details.locationName} · ${details.totalItems || 0} çeşit · ${details.discrepancies || 0} uyuşmazlık`;
    case 'BULK_IMPORT':
      return `${details.count || 0} ürün aktarıldı`;
    case 'ADD_USER':
      return `${details.newUser} · ${details.role}`;
    case 'EDIT_USER':
      return `${details.targetUser} · ${details.role}`;
    case 'DELETE_USER':
      return details.deletedUser || '?';
    case 'ADD_LOCATION':
    case 'EDIT_LOCATION':
    case 'DELETE_LOCATION':
      return details.locationName || details.locationId || '?';
    default:
      return JSON.stringify(details).slice(0, 80);
  }
}

function renderActivityDetails(log, locations = []) {
  const details = log.details || {};
  
  const getFriendlyKey = (key) => {
    const keys = {
      productName: 'Ürün Adı',
      sku: 'SKU / Barkod',
      quantity: 'Miktar',
      locationId: 'Lokasyon',
      locationName: 'Lokasyon Adı',
      newUser: 'Yeni Kullanıcı',
      newEmail: 'Yeni E-posta',
      role: 'Yetki Rolü',
      targetUser: 'Hedef Kullanıcı',
      targetUid: 'Kullanıcı UID',
      change: 'Değişiklik',
      deletedUser: 'Silinen Kullanıcı',
      deletedUid: 'Silinen UID',
      count: 'Aktarılan Kayıt Sayısı',
      from: 'Çıkış Lokasyonu',
      to: 'Hedef Lokasyon',
      itemCount: 'Kalem Sayısı',
      discrepancies: 'Uyuşmazlık Sayısı',
      totalItems: 'Sayılan Ürün Çeşidi',
      updates: 'Güncellemeler',
      status: 'Durum',
      name: 'İsim',
      type: 'Tür',
      address: 'Adres',
      price: 'Fiyat',
      cost: 'Maliyet',
      shelf: 'Raf',
      barcode: 'Barkod'
    };
    return keys[key] || key;
  };

  const getFriendlyValue = (key, value) => {
    if (typeof value === 'boolean') return value ? 'Evet' : 'Hayır';
    
    if (key === 'locationId') {
      const loc = locations.find(l => l.id === value);
      return loc ? loc.name : value;
    }

    if (key === 'role') {
      if (value === 'admin') return 'Yönetici';
      if (value === 'staff') return 'Personel';
      if (value === 'manager') return 'Müdür';
    }

    if (key === 'status') {
      if (value === 'active') return 'Aktif';
      if (value === 'inactive') return 'Pasif';
    }
    if (key === 'type') {
      if (value === 'store') return 'Mağaza';
      if (value === 'warehouse') return 'Depo';
    }
    if (key === 'change') {
      if (value === 'deactivated') return 'Erişim Kapatıldı';
    }

    return String(value);
  };

  const renderRow = (key, value) => {
    if (key === 'deletedUid' || key === 'targetUid' || key === 'invId') return null;
    if (value === undefined || value === null) return null;
    
    let displayValue = value;
    let label = getFriendlyKey(key);

    if (typeof value === 'object') {
      displayValue = Object.entries(value).map(([k, v]) => {
        return `${getFriendlyKey(k)}: ${getFriendlyValue(k, v)}`;
      }).join(' • ');
    } else {
      displayValue = getFriendlyValue(key, value);
    }

    return (
      <div key={key} className="py-2.5 flex justify-between items-start text-sm border-b border-slate-100 last:border-0">
        <span className="font-semibold text-slate-500 min-w-[120px] shrink-0">{label}</span>
        <span className="text-slate-800 break-all text-right font-semibold">{displayValue}</span>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-slate-700 mb-1">İşlem Detayları</h3>
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 divide-y divide-slate-100">
        {Object.entries(details).map(([key, val]) => renderRow(key, val))}
      </div>
    </div>
  );
}


export default function ActivityLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const transferLog = useStore(state => state.transferLog);
  const countLogs = useStore(state => state.countLogs);
  const products = useStore(state => state.products);
  const locations = useStore(state => state.locations);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const dbLogs = await loadActivityLog(200).catch(err => {
        console.error('Failed to load activity log from DB:', err);
        return [];
      });
      
      const tLogs = (transferLog || []).map(t => {
        const enhancedItems = (t.items || []).map(item => {
          if (item.name && item.name !== '-') return item;
          const p = products.find(prod => prod.id === item.productId);
          return {
            ...item,
            name: p?.name || 'Bilinmeyen Ürün',
            barcode: p?.barcode || p?.sku || '-',
            quantity: item.quantity || item.transferQty || 1
          };
        });
        return {
          id: t.id,
          action: 'TRANSFER',
          userName: t.user,
          timestamp: t.date,
          details: {
            from: t.from,
            to: t.to,
            itemCount: t.items?.length || t.itemCount,
            items: enhancedItems
          }
        };
      });

      const cLogs = (countLogs || []).map(c => {
        const enhancedItems = (c.items || []).map(item => {
          if (item.name && item.name !== '-') return item;
          const p = products.find(prod => prod.id === item.productId);
          return {
            ...item,
            name: p?.name || 'Bilinmeyen Ürün'
          };
        });
        return {
          id: c.id,
          action: 'COUNT',
          userName: c.user,
          timestamp: c.date,
          details: {
            locationName: c.locationName,
            totalItems: c.totalItems,
            discrepancies: c.discrepancies,
            items: enhancedItems
          }
        };
      });

      const getLogDate = (log) => {
        if (!log.timestamp) return null;
        return log.timestamp.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
      };

      // Match and merge
      const mergedDbLogs = dbLogs.map(dbLog => {
        if (dbLog.action === 'TRANSFER') {
          const dbDate = getLogDate(dbLog);
          const matchIndex = tLogs.findIndex(tLog => {
            const tDate = getLogDate(tLog);
            if (!dbDate || !tDate) return false;
            const timeDiff = Math.abs(dbDate.getTime() - tDate.getTime());
            return timeDiff < 10000 && tLog.details.from === dbLog.details.from && tLog.details.to === dbLog.details.to;
          });
          if (matchIndex > -1) {
            const matched = tLogs[matchIndex];
            tLogs.splice(matchIndex, 1);
            return {
              ...dbLog,
              details: {
                ...dbLog.details,
                items: matched.details.items
              }
            };
          }
        } else if (dbLog.action === 'COUNT') {
          const dbDate = getLogDate(dbLog);
          const matchIndex = cLogs.findIndex(cLog => {
            const cDate = getLogDate(cLog);
            if (!dbDate || !cDate) return false;
            const timeDiff = Math.abs(dbDate.getTime() - cDate.getTime());
            return timeDiff < 10000 && cLog.details.locationName === dbLog.details.locationName;
          });
          if (matchIndex > -1) {
            const matched = cLogs[matchIndex];
            cLogs.splice(matchIndex, 1);
            return {
              ...dbLog,
              details: {
                ...dbLog.details,
                items: matched.details.items
              }
            };
          }
        }
        return dbLog;
      });

      const all = [...mergedDbLogs, ...tLogs, ...cLogs];
      const unique = Array.from(new Map(all.map(item => [item.id, item])).values());
      
      unique.sort((a, b) => {
        const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : (a.timestamp ? new Date(a.timestamp).getTime() : 0);
        const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : (b.timestamp ? new Date(b.timestamp).getTime() : 0);
        return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
      });

      setLogs(unique);
    } catch (err) {
      toast.error('Log yüklenemedi: ' + err.message);
    }
    setLoading(false);
  };

  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => { fetchLogs(); }, []);

  const uniqueUsers = [...new Set(logs.map(l => l.userName).filter(Boolean))];
  const uniqueActions = [...new Set(logs.map(l => l.action).filter(Boolean))];

  const filtered = logs.filter(log => {
    const matchAction = !filterAction || log.action === filterAction;
    const matchUser = !filterUser || log.userName === filterUser;
    const matchSearch = !searchTerm || (
      (log.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ACTION_CONFIG[log.action]?.label || log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (formatDetails(log.action, log.details || {})).toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchAction && matchUser && matchSearch;
  });

  const formatTime = (timestamp) => {
    if (!timestamp) return '—';
    const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const roleColor = {
    admin: 'bg-purple-100 text-purple-700',
    manager: 'bg-blue-100 text-blue-700',
    staff: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">İşlem Kayıtları</h1>
          <p className="text-slate-500 mt-1 text-sm">Sistemde yapılan tüm işlemleri ve kimin yaptığını görün.</p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors text-sm disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Yenile
        </button>
      </div>

      {/* ── Filters ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 card-shadow p-4 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text" value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="İsim, işlem veya detay ara..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none text-sm"
          />
        </div>

        {/* Action filter */}
        <select
          value={filterAction}
          onChange={e => setFilterAction(e.target.value)}
          className="text-sm border border-slate-200 bg-slate-50 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">Tüm İşlemler</option>
          {uniqueActions.map(a => (
            <option key={a} value={a}>{ACTION_CONFIG[a]?.label || a}</option>
          ))}
        </select>

        {/* User filter */}
        <select
          value={filterUser}
          onChange={e => setFilterUser(e.target.value)}
          className="text-sm border border-slate-200 bg-slate-50 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">Tüm Kullanıcılar</option>
          {uniqueUsers.map(u => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>

        <span className="ml-auto text-xs text-slate-400 font-medium">{filtered.length} kayıt</span>
      </div>

      {/* ── Log Table ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 card-shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw size={24} className="animate-spin text-slate-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Activity size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 font-medium">Kayıt bulunamadı</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-100">
                  <tr>
                    {['İşlem', 'Kullanıcı', 'Detay', 'Tarih / Saat'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((log) => {
                    const cfg = ACTION_CONFIG[log.action] || { label: log.action, icon: Activity, color: 'text-slate-500', bg: 'bg-slate-50', badge: 'bg-slate-100 text-slate-600' };
                    const Icon = cfg.icon;
                    return (
                      <tr key={log.id} onClick={() => setSelectedLog(log)} className="hover:bg-slate-50/80 transition-colors cursor-pointer">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`h-8 w-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                              <Icon size={15} className={cfg.color} />
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                              {cfg.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-slate-800">{log.userName || '—'}</div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${roleColor[log.userRole] || 'bg-slate-100 text-slate-500'}`}>
                            {log.userRole || ''}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 text-xs max-w-xs truncate">
                          {formatDetails(log.action, log.details || {})}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                          {formatTime(log.timestamp)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-slate-100">
              {filtered.map((log) => {
                const cfg = ACTION_CONFIG[log.action] || { label: log.action, icon: Activity, color: 'text-slate-500', bg: 'bg-slate-50', badge: 'bg-slate-100 text-slate-600' };
                const Icon = cfg.icon;
                return (
                  <div key={log.id} onClick={() => setSelectedLog(log)} className="p-4 flex gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className={`h-10 w-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <Icon size={18} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                        <span className="text-[10px] text-slate-400">{formatTime(log.timestamp)}</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-800">{log.userName || '—'}</div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate">{formatDetails(log.action, log.details || {})}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-400">
              Son <strong className="text-slate-600">{filtered.length}</strong> işlem gösteriliyor
            </div>
          </>
        )}
      </div>

      {/* ── Details Modal ─────────────────────────────────────── */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelectedLog(null)}>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <span className={`p-1.5 rounded-lg ${ACTION_CONFIG[selectedLog.action]?.bg} ${ACTION_CONFIG[selectedLog.action]?.color}`}>
                  {ACTION_CONFIG[selectedLog.action] && React.createElement(ACTION_CONFIG[selectedLog.action].icon, { size: 18 })}
                </span>
                {ACTION_CONFIG[selectedLog.action]?.label || selectedLog.action} Detayları
              </h2>
              <button onClick={() => setSelectedLog(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="mb-4 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="font-semibold text-slate-500">İşlem Yapan:</span> {selectedLog.userName || 'Bilinmiyor'}</div>
                  <div><span className="font-semibold text-slate-500">Tarih:</span> {formatTime(selectedLog.timestamp)}</div>
                  {selectedLog.details?.from && <div><span className="font-semibold text-slate-500">Çıkış:</span> {selectedLog.details.from}</div>}
                  {selectedLog.details?.to && <div><span className="font-semibold text-slate-500">Giriş:</span> {selectedLog.details.to}</div>}
                </div>
              </div>

              {selectedLog.action === 'TRANSFER' ? (
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-700 mb-2">Transfer Edilen Ürünler</h3>
                  {selectedLog.details?.items ? (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-2 font-semibold text-slate-600">Ürün</th>
                            <th className="px-4 py-2 font-semibold text-slate-600">Barkod</th>
                            <th className="px-4 py-2 font-semibold text-slate-600 text-right">Miktar</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedLog.details.items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="px-4 py-2 text-slate-800">{item.name || item.productName || '-'}</td>
                              <td className="px-4 py-2 text-slate-500 font-mono text-xs">{item.barcode || item.sku || '-'}</td>
                              <td className="px-4 py-2 text-slate-800 font-bold text-right">{item.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
                      <div className="flex justify-between py-2 text-sm border-b border-slate-100 last:border-0">
                        <span className="font-semibold text-slate-500">Ürün Detayı:</span>
                        <span className="text-slate-800 font-semibold">{selectedLog.details?.productNames || '—'}</span>
                      </div>
                      <div className="flex justify-between py-2 text-sm border-b border-slate-100 last:border-0">
                        <span className="font-semibold text-slate-500">Kalem Sayısı:</span>
                        <span className="text-slate-800 font-semibold">{selectedLog.details?.itemCount || 1}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : selectedLog.action === 'COUNT' ? (
                <div className="space-y-2">
                   <h3 className="font-bold text-slate-700 mb-2">Sayılan Ürünler</h3>
                   {selectedLog.details?.items ? (
                     <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                       <table className="w-full text-left text-sm">
                         <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                           <tr>
                             <th className="px-4 py-2 font-semibold text-slate-600">Ürün</th>
                             <th className="px-4 py-2 font-semibold text-slate-600 text-right">Beklenen</th>
                             <th className="px-4 py-2 font-semibold text-slate-600 text-right">Sayılan</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                           {selectedLog.details.items.map((item, idx) => (
                             <tr key={idx} className="hover:bg-slate-50">
                               <td className="px-4 py-2 text-slate-800 text-xs">{item.name || item.productName || '-'}</td>
                               <td className="px-4 py-2 text-slate-500 text-right">{item.expected}</td>
                               <td className={`px-4 py-2 font-bold text-right ${item.counted !== item.expected ? 'text-orange-600' : 'text-emerald-600'}`}>{item.counted}</td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     </div>
                   ) : (
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
                       <div className="flex justify-between py-2 text-sm border-b border-slate-100 last:border-0">
                         <span className="font-semibold text-slate-500">Uyuşmazlık Sayısı:</span>
                         <span className="text-slate-800 font-semibold">{selectedLog.details?.discrepancies || 0}</span>
                       </div>
                       <div className="flex justify-between py-2 text-sm border-b border-slate-100 last:border-0">
                         <span className="font-semibold text-slate-500">Sayılan Çeşit:</span>
                         <span className="text-slate-800 font-semibold">{selectedLog.details?.totalItems || 0}</span>
                       </div>
                     </div>
                   )}
                </div>
              ) : selectedLog.action === 'BULK_IMPORT' && selectedLog.details?.items ? (
                <div className="space-y-2">
                   <h3 className="font-bold text-slate-700 mb-2">Toplu Aktarılan Ürünler</h3>
                   <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                     <table className="w-full text-left text-sm">
                       <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                         <tr>
                           <th className="px-4 py-2 font-semibold text-slate-600">Ürün</th>
                           <th className="px-4 py-2 font-semibold text-slate-600">Barkod</th>
                           <th className="px-4 py-2 font-semibold text-slate-600 text-right">Eklenen Miktar</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                         {selectedLog.details.items.map((item, idx) => (
                           <tr key={idx} className="hover:bg-slate-50">
                             <td className="px-4 py-2 text-slate-800 text-xs">{item.name || item.productName || '-'}</td>
                             <td className="px-4 py-2 text-slate-500 font-mono text-xs">{item.barcode || item.sku || '-'}</td>
                             <td className="px-4 py-2 font-bold text-emerald-600 text-right">+{item.quantity}</td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                </div>
              ) : (
                renderActivityDetails(selectedLog, locations)
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setSelectedLog(null)} className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors">
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
