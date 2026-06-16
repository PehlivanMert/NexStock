import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Search, Filter, Edit2, Trash2, Plus, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function AdminInventory() {
  const inventory = useStore(state => state.inventory);
  const products = useStore(state => state.products);
  const locations = useStore(state => state.locations);
  const deleteProduct = useStore(state => state.deleteProduct);
  const updateInventoryCount = useStore(state => state.updateInventoryCount);
  const updateInventoryItem = useStore(state => state.updateInventoryItem);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterLoc, setFilterLoc] = useState('');
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
    (filterLoc === '' || item.locationId === filterLoc)
  );

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

  const handleDelete = (invId, name) => {
    setConfirmDelete({ id: invId, name });
  };

  const forceDelete = () => {
    deleteProduct(confirmDelete.id);
    toast.success('Ürün stoklardan silindi.', { description: confirmDelete.name });
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gelişmiş Envanter Yönetimi</h1>
          <p className="text-slate-500 mt-1">Sistemdeki tüm stokların detaylı listesi ve yönetimi.</p>
        </div>
        <Link to="/add" className="bg-primary-600 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm hover:bg-primary-700 flex items-center gap-2">
          <Plus size={20} />
          Yeni Ürün Ekle
        </Link>
      </div>

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-slate-800">Stok Kaydını Düzenle</h2>
              <button onClick={() => setEditItem(null)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800">{editItem.productName}</div>
                <div className="text-xs font-mono text-slate-500 mt-0.5">{editItem.sku}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stok Miktarı</label>
                  <input
                    type="number" min="0"
                    value={editForm.quantity}
                    onChange={e => setEditForm({ ...editForm, quantity: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-bold text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Raf / Bölüm</label>
                  <input
                    type="text"
                    value={editForm.shelf}
                    onChange={e => setEditForm({ ...editForm, shelf: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="A-12"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lokasyon</label>
                <select
                  value={editForm.locationId}
                  onChange={e => setEditForm({ ...editForm, locationId: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditItem(null)} className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50">İptal</button>
              <button onClick={handleEditSave} className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 flex items-center justify-center gap-2">
                <Save size={18} /> Kaydet
              </button>
            </div>
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
            <h3 className="font-bold text-lg text-slate-800 mb-2">Stoku Sil?</h3>
            <p className="text-sm text-slate-500 mb-6"><strong>{confirmDelete.name}</strong> stoklardan kaldırılacak.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50">Vazgeç</button>
              <button onClick={forceDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700">Sil</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 flex-wrap gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ürün adı veya SKU..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              value={filterLoc}
              onChange={e => setFilterLoc(e.target.value)}
              className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="">Tüm Lokasyonlar</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Ürün Adı</th>
                <th className="px-6 py-4">SKU / Barkod</th>
                <th className="px-6 py-4">Lokasyon</th>
                <th className="px-6 py-4">Raf/Bölüm</th>
                <th className="px-6 py-4">Miktar</th>
                <th className="px-6 py-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">Sonuç bulunamadı.</td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{item.productName}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      <div>{item.sku}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{item.barcode}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {item.locationName}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{item.shelf}</td>
                    <td className="px-6 py-4">
                      <span className={`font-bold text-base ${item.quantity < 10 ? 'text-red-600' : 'text-slate-800'}`}>
                        {item.quantity}
                      </span>
                      {item.quantity < 10 && <span className="ml-1 text-xs text-red-500 font-medium">⚠ Kritik</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEdit(item)} className="p-2 text-slate-400 hover:text-primary-600 transition-colors inline-block">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id, item.productName)} className="p-2 text-slate-400 hover:text-red-600 transition-colors inline-block ml-1">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
          <div>Toplam <strong>{filteredData.length}</strong> kayıt gösteriliyor.</div>
        </div>
      </div>
    </div>
  );
}
