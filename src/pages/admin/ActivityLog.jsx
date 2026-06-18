import { useState, useEffect } from 'react';
import { Activity, Filter, RefreshCw, User, Package, ArrowRightLeft, ClipboardList, Plus, Trash2, Edit2, Users, MapPin, Upload, Search } from 'lucide-react';
import { loadActivityLog } from '../../lib/firestoreService';
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

export default function ActivityLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await loadActivityLog(200);
      setLogs(data);
    } catch (err) {
      toast.error('Log yüklenemedi: ' + err.message);
    }
    setLoading(false);
  };

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
            <div className="hidden md:block overflow-x-auto">
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
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
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
            <div className="md:hidden divide-y divide-slate-100">
              {filtered.map((log) => {
                const cfg = ACTION_CONFIG[log.action] || { label: log.action, icon: Activity, color: 'text-slate-500', bg: 'bg-slate-50', badge: 'bg-slate-100 text-slate-600' };
                const Icon = cfg.icon;
                return (
                  <div key={log.id} className="p-4 flex gap-3">
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
    </div>
  );
}
