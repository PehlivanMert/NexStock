import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Search, Filter, Edit2, Trash2, Plus, X, Save, Package, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function AdminInventory() {
  const inventory = useStore(state => state.inventory);
  const products = useStore(state => state.products);
  const locations = useStore(state => state.locations);
  const deleteProduct = useStore(state => state.deleteProduct);
  const updateInventoryItem = useStore(state => state.updateInventoryItem);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterLoc, setFilterLoc] = useState('');
  const [filterCritical, setFilterCritical] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);

  const combinedData = inventory.map(inv => {
    const product = products.find(p => p.id === inv.productId);
    const location = locations.find(l => l.id === inv.locationId);
    return {
      ...inv,
      productName: product?.name || 'Bilinmeyen',
      sku: product?.sku || '-',
      barcode: product?.barcode || '-',
      locationName: location?.name || '-',
    };
  });

  const filteredData = combinedData.filter(item =>
    (item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.sku.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterLoc === '' || item.locationId === filterLoc) &&
    (!filterCritical || item.quantity <= 0)
  );

  const criticalCount = combinedData.filter(i => i.quantity <= 0).length;

  const openEdit = (item) => {
    setEditItem(item);
    setEditForm({ quantity: item.quantity, shelf: item.shelf, locationId: item.locationId });
  };

  const handleEditSave = () => {
    updateInventoryItem(editItem.id, {
      quantity: parseInt(editForm.quantity) || 0,
      shelf: editForm.shelf,
      locationId: editForm.locationId,
    });
    toast.success('Stok kaydı güncellendi!');
    setEditItem(null);
  };

  const forceDelete = () => {
    deleteProduct(confirmDelete.id);
    toast.success('Ürün stoklardan silindi.', { description: confirmDelete.name });
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Envanter Yönetimi</h1>
          <p className="text-slate-500 mt-1 text-sm">Sistemdeki tüm stok kayıtlarını görüntüleyin ve düzenleyin.</p>
        </div>
        <Link
          to="/add"
          className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary-500/25 hover:from-primary-400 hover:to-primary-500 transition-all active:scale-98"
        >
          <Plus size={18} /> Yeni Ürün Ekle
        </Link>
      </div>

      {/* ── Edit Modal ────────────────────────────────────── */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800">Stok Kaydını Düzenle</h2>
                <button onClick={() => setEditItem(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="mt-3 p-3 bg-slate-50 rounded-xl">
                <div className="font-bold text-slate-800">{editItem.productName}</div>
                <div className="text-xs font-mono text-slate-500 mt-0.5">{editItem.sku}</div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Miktar</label>
                  <input
                    type="number" min="0"
                    value={editForm.quantity}
                    onChange={e => setEditForm({ ...editForm, quantity: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none font-black text-xl text-center bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Raf</label>
                  <input
                    type="text"
                    value={editForm.shelf}
                    onChange={e => setEditForm({ ...editForm, shelf: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none bg-slate-50"
                    placeholder="A-12"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Lokasyon</label>
                <select
                  value={editForm.locationId}
                  onChange={e => setEditForm({ ...editForm, locationId: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none bg-slate-50"
                >
                  {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditItem(null)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors">İptal</button>
                <button onClick={handleEditSave} className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
                  <Save size={16} /> Kaydet
                </button>
              </div>
            </div>
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
            <h3 className="font-bold text-lg text-slate-800 mb-2">Stoku Sil?</h3>
            <p className="text-sm text-slate-500 mb-6"><strong>{confirmDelete.name}</strong> stoklardan kaldırılacak.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50">Vazgeç</button>
              <button onClick={forceDelete} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">Sil</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Table Card ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 card-shadow overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Ürün adı veya SKU..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-400" />
            <select
              value={filterLoc}
              onChange={e => setFilterLoc(e.target.value)}
              className="text-sm border border-slate-200 bg-slate-50 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-primary-500/20 outline-none"
            >
              <option value="">Tüm Lokasyonlar</option>
              {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
            </select>
          </div>

          {criticalCount > 0 && (
            <button
              onClick={() => setFilterCritical(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                filterCritical
                  ? 'bg-red-600 text-white shadow-md shadow-red-400/20'
                  : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
              }`}
            >
              <AlertTriangle size={13} /> {criticalCount} Kritik
            </button>
          )}

          <span className="ml-auto text-xs text-slate-400 font-medium">{filteredData.length} kayıt</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                {['Ürün', 'SKU / Barkod', 'Lokasyon', 'Raf', 'Miktar', ''].map(h => (
                  <th key={h} className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <Package size={32} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-500 font-medium">Sonuç bulunamadı</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${item.quantity <= 0 ? 'bg-red-50' : 'bg-slate-100'}`}>
                          <Package size={16} className={item.quantity <= 0 ? 'text-red-500' : 'text-slate-400'} />
                        </div>
                        <span className="font-semibold text-slate-800">{item.productName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">
                      <div className="font-semibold">{item.sku}</div>
                      <div className="text-slate-400 mt-0.5">{item.barcode}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700">
                        {item.locationName}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-sm text-slate-600">{item.shelf || '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-black text-lg ${item.quantity <= 0 ? 'text-red-600' : 'text-slate-800'}`}>
                          {item.quantity}
                        </span>
                        {item.quantity <= 0 && (
                          <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-black">KRİTİK</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete({ id: item.id, name: item.productName })}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-400">
          <span>Toplam <strong className="text-slate-600">{filteredData.length}</strong> kayıt</span>
          {criticalCount > 0 && (
            <span className="text-red-500 font-bold">{criticalCount} kritik stok uyarısı</span>
          )}
        </div>
      </div>
    </div>
  );
}
