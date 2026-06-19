import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Store, Warehouse, Edit2, Trash2, X, CheckCircle2, Package } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { toast } from 'sonner';

export default function Locations() {
  const navigate = useNavigate();
  const locations = useStore(state => state.locations);
  const inventory = useStore(state => state.inventory);
  const addLocation = useStore(state => state.addLocation);
  const deleteLocation = useStore(state => state.deleteLocation);
  const updateLocation = useStore(state => state.updateLocation);
  const updateProfile = useStore(state => state.updateProfile);

  const [showForm, setShowForm] = useState(false);
  const [editingLoc, setEditingLoc] = useState(null);
  const [formData, setFormData] = useState({ name: '', type: 'store', address: '', status: 'active' });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const openAdd = () => {
    setEditingLoc(null);
    setFormData({ name: '', type: 'store', address: '', status: 'active' });
    setShowForm(true);
  };

  const openEdit = (loc) => {
    setEditingLoc(loc);
    setFormData({ name: loc.name, type: loc.type, address: loc.address, status: loc.status });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingLoc) {
      updateLocation(editingLoc.id, formData);
      toast.success('Lokasyon güncellendi!');
    } else {
      addLocation(formData);
      toast.success('Yeni lokasyon eklendi!');
    }
    setShowForm(false);
    setEditingLoc(null);
    setFormData({ name: '', type: 'store', address: '', status: 'active' });
  };

  const handleDelete = (loc) => {
    const stockCount = inventory.filter(i => i.locationId === loc.id).length;
    if (stockCount > 0) {
      setConfirmDelete(loc);
    } else {
      deleteLocation(loc.id);
      toast.success('Lokasyon silindi.', { description: loc.name });
    }
  };

  const forceDelete = () => {
    deleteLocation(confirmDelete.id);
    toast.success('Lokasyon ve tüm stokları silindi.', { description: confirmDelete.name });
    setConfirmDelete(null);
  };

  const typeConfig = {
    warehouse: { label: 'Depo', icon: Warehouse, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', iconColor: 'text-blue-600' },
    store: { label: 'Mağaza', icon: Store, gradient: 'from-violet-500 to-violet-600', bg: 'bg-violet-50', iconColor: 'text-violet-600' },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Depo ve Mağaza Yönetimi</h1>
          <p className="text-slate-500 mt-1 text-sm">Tüm lokasyonları yönetin ve yeni tesis ekleyin.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary-500/25 hover:from-primary-400 hover:to-primary-500 transition-all"
        >
          <Plus size={18} /> Yeni Lokasyon
        </button>
      </div>

      {/* ── Add/Edit Modal ─────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">
                {editingLoc ? 'Lokasyonu Düzenle' : 'Yeni Lokasyon Ekle'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Lokasyon Adı</label>
                <input
                  required type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none bg-slate-50 text-sm"
                  placeholder="Örn: Levent Depo"
                />
              </div>

              {/* Type selector cards */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Tür</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(typeConfig).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    const selected = formData.type === key;
                    return (
                      <button
                        key={key} type="button"
                        onClick={() => setFormData({ ...formData, type: key })}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                          selected
                            ? 'border-primary-400 bg-primary-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className={`h-9 w-9 rounded-xl ${selected ? 'bg-primary-100' : cfg.bg} flex items-center justify-center`}>
                          <Icon size={18} className={selected ? 'text-primary-600' : cfg.iconColor} />
                        </div>
                        <span className={`font-semibold text-sm ${selected ? 'text-primary-700' : 'text-slate-700'}`}>
                          {cfg.label}
                        </span>
                        {selected && <CheckCircle2 size={16} className="text-primary-600 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Durum</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none bg-slate-50 text-sm"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Açık Adres</label>
                <textarea
                  required
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none bg-slate-50 text-sm resize-none"
                  rows="2"
                  placeholder="Lokasyonun tam adresi..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 text-sm">İptal</button>
                <button type="submit" className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 text-sm">
                  {editingLoc ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ────────────────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center animate-scale-in">
            <div className="h-16 w-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-red-600" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">Lokasyonu Sil?</h3>
            <p className="text-sm text-slate-500 mb-6">
              <strong>{confirmDelete.name}</strong> lokasyonuna ait stok kayıtları da silinecektir.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50">Vazgeç</button>
              <button onClick={forceDelete} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">Sil</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Location Cards ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {locations.map(loc => {
          const locInv = inventory.filter(i => i.locationId === loc.id);
          const stockTotal = locInv.reduce((a, b) => a + b.quantity, 0);
          const stockTypes = locInv.length;
          const criticalCount = locInv.filter(i => i.quantity < 10).length;
          const cfg = typeConfig[loc.type] || typeConfig.store;
          const Icon = cfg.icon;

          return (
            <div key={loc.id} onClick={() => { updateProfile({ activeLocationId: loc.id }); navigate('/inventory'); }} className="bg-white rounded-2xl border border-slate-200/80 card-shadow overflow-hidden hover:border-slate-300 hover:shadow-lg transition-all group cursor-pointer">
              {/* Card header with gradient */}
              <div className={`bg-gradient-to-br ${cfg.gradient} p-5`}>
                <div className="flex items-start justify-between">
                  <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Icon size={24} className="text-white" />
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(loc); }}
                      className="p-2 bg-white/15 hover:bg-white/25 rounded-xl text-white transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(loc); }}
                      className="p-2 bg-white/15 hover:bg-red-500/40 rounded-xl text-white transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-black text-white mt-3 leading-tight">{loc.name}</h3>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${loc.status === 'active' ? 'bg-white/25 text-white' : 'bg-black/20 text-white/60'}`}>
                    {loc.status === 'active' ? '● Aktif' : '○ Pasif'}
                  </span>
                  <span className="text-white/60 text-xs">{cfg.label}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="p-4">
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center">
                    <div className="text-xl font-black text-slate-800">{stockTotal}</div>
                    <div className="text-[10px] text-slate-400 font-medium">adet stok</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-black text-slate-800">{stockTypes}</div>
                    <div className="text-[10px] text-slate-400 font-medium">çeşit ürün</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xl font-black ${criticalCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{criticalCount}</div>
                    <div className="text-[10px] text-slate-400 font-medium">kritik</div>
                  </div>
                </div>

                {loc.address && (
                  <p className="text-xs text-slate-400 flex items-start gap-1.5 border-t border-slate-100 pt-3">
                    <MapPin size={12} className="shrink-0 mt-0.5 text-slate-300" />
                    <span className="line-clamp-2">{loc.address}</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
