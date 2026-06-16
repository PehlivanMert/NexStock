import { useState } from 'react';
import { MapPin, Plus, Store, Warehouse, Edit2, Trash2, X, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { toast } from 'sonner';

export default function Locations() {
  const locations = useStore(state => state.locations);
  const inventory = useStore(state => state.inventory);
  const addLocation = useStore(state => state.addLocation);
  const deleteLocation = useStore(state => state.deleteLocation);
  // We'll add editLocation to store
  const updateLocation = useStore(state => state.updateLocation);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Depo ve Mağaza Yönetimi</h1>
          <p className="text-slate-500 mt-1">Sistemdeki tüm lokasyonları yönetin ve yeni lokasyon ekleyin.</p>
        </div>
        <button onClick={openAdd} className="bg-primary-600 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm hover:bg-primary-700 flex items-center gap-2">
          <Plus size={20} />
          Yeni Ekle
        </button>
      </div>

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-slate-800">
                {editingLoc ? 'Lokasyonu Düzenle' : 'Yeni Lokasyon Ekle'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lokasyon Adı</label>
                <input
                  required type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Örn: Levent Depo"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tür</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="store">Mağaza</option>
                    <option value="warehouse">Depo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Durum</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Açık Adres</label>
                <textarea
                  required
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  rows="2"
                  placeholder="Lokasyonun tam adresi..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50">
                  İptal
                </button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">
                  {editingLoc ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center">
            <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} />
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">Lokasyonu Sil?</h3>
            <p className="text-sm text-slate-500 mb-6">
              <strong>{confirmDelete.name}</strong> lokasyonuna ait stok kayıtları da silinecektir. Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50">
                Vazgeç
              </button>
              <button onClick={forceDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700">
                Sil
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map(loc => {
          const stockCount = inventory.filter(i => i.locationId === loc.id).length;
          return (
            <div key={loc.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${loc.type === 'warehouse' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                  {loc.type === 'warehouse' ? <Warehouse size={24} /> : <Store size={24} />}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(loc)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(loc)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-lg text-slate-800 mb-1">{loc.name}</h3>
              <p className="text-sm text-slate-500 flex items-start gap-1">
                <MapPin size={16} className="shrink-0 mt-0.5" />
                <span>{loc.address}</span>
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${loc.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                    {loc.status === 'active' ? 'Aktif' : 'Pasif'}
                  </span>
                  <span className="text-xs text-slate-400">{stockCount} kalem stok</span>
                </div>
                <span className="text-sm font-medium text-primary-600 hover:underline cursor-pointer" onClick={() => openEdit(loc)}>
                  Düzenle →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
