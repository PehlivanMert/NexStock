import { Package, Search, Filter, Plus, X, Edit2, Trash2, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore, ROLE_PERMISSIONS } from '../store/useStore';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Inventory() {
  const user = useStore(state => state.user);
  const inventory = useStore(state => state.inventory);
  const products = useStore(state => state.products);
  const locations = useStore(state => state.locations);
  const deleteProduct = useStore(state => state.deleteProduct);
  const updateInventoryItem = useStore(state => state.updateInventoryItem);

  const perms = ROLE_PERMISSIONS[user?.role] || {};

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const combinedData = inventory.map(inv => {
    const product = products.find(p => p.id === inv.productId);
    const location = locations.find(l => l.id === inv.locationId);
    return {
      ...inv,
      productName: product?.name || 'Bilinmeyen',
      sku: product?.sku || '',
      barcode: product?.barcode || '',
      locationName: location?.name || '',
    };
  });

  const filteredData = combinedData.filter(item =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.barcode.includes(searchTerm)
  );

  const openProduct = (item) => {
    setSelectedProduct(item);
    setEditing(false);
    setConfirmDelete(false);
    setEditForm({ quantity: item.quantity, shelf: item.shelf, locationId: item.locationId });
  };

  const handleSaveEdit = () => {
    updateInventoryItem(selectedProduct.id, {
      quantity: parseInt(editForm.quantity) || 0,
      shelf: editForm.shelf,
      locationId: editForm.locationId,
    });
    toast.success('Stok güncellendi!');
    setSelectedProduct(null);
    setEditing(false);
  };

  const handleDelete = () => {
    deleteProduct(selectedProduct.id);
    toast.success(`${selectedProduct.productName} stoklardan silindi.`);
    setSelectedProduct(null);
    setConfirmDelete(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <div className="bg-white px-4 py-3 border-b border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ürün, SKU veya barkod ara..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-100 border-transparent focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 rounded-xl transition-all outline-none"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          )}
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-slate-500">{filteredData.length} kayıt</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-24">
        {filteredData.length === 0 ? (
          <div className="text-center p-8 text-slate-400">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Ürün bulunamadı.</p>
          </div>
        ) : (
          filteredData.map((item) => (
            <div
              key={item.id}
              onClick={() => openProduct(item)}
              className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 cursor-pointer active:bg-slate-50 transition-colors"
            >
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${item.quantity < 10 ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-400'}`}>
                <Package size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-800 truncate">{item.productName}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">{item.sku}</p>
                <div className="text-[10px] text-primary-600 font-medium mt-1">{item.locationName}</div>
              </div>
              <div className="text-right shrink-0">
                <div className={`font-bold text-lg ${item.quantity < 10 ? 'text-red-600' : 'text-slate-800'}`}>{item.quantity}</div>
                <div className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5 inline-block">{item.shelf}</div>
                {item.quantity < 10 && <div className="text-[9px] text-red-500 font-bold mt-0.5">KRİTİK</div>}
              </div>
            </div>
          ))
        )}
      </div>

      {perms.canDeleteInventory && (
        <Link to="/add" className="absolute bottom-20 right-4 h-14 w-14 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-primary-500/40 hover:bg-primary-700 active:scale-95 transition-transform z-10">
          <Plus size={28} />
        </Link>
      )}

      {/* Product Detail / Edit Sheet */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start mb-5">
              <div className="flex gap-3 items-center">
                <div className="h-14 w-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                  <Package size={28} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 leading-tight">{selectedProduct.productName}</h2>
                  <p className="text-xs font-mono text-slate-500">{selectedProduct.sku}</p>
                </div>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="p-2 bg-slate-100 text-slate-500 rounded-full">
                <X size={18} />
              </button>
            </div>

            {!editing ? (
              <>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                    <span className="text-sm font-medium text-slate-500">Mevcut Stok</span>
                    <span className={`text-2xl font-bold ${selectedProduct.quantity < 10 ? 'text-red-600' : 'text-slate-800'}`}>{selectedProduct.quantity}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-xs text-slate-500 block mb-1">Lokasyon</span>
                      <span className="text-sm font-bold text-slate-800">{selectedProduct.locationName}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-xs text-slate-500 block mb-1">Raf / Bölüm</span>
                      <span className="text-sm font-bold text-slate-800">{selectedProduct.shelf}</span>
                    </div>
                  </div>
                  {selectedProduct.barcode !== '-' && (
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-xs text-slate-500 block mb-1">Barkod</span>
                      <span className="text-sm font-mono font-bold text-slate-800">{selectedProduct.barcode}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  {perms.canDeleteInventory && (
                    <button onClick={() => setEditing(true)} className="flex-1 py-3 bg-primary-50 text-primary-600 rounded-xl font-bold flex items-center justify-center gap-2">
                      <Edit2 size={16} /> Düzenle
                    </button>
                  )}
                  {perms.canDeleteInventory && (
                    <button onClick={() => setConfirmDelete(true)} className="flex-[0.6] py-3 bg-red-50 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2">
                      <Trash2 size={16} /> Sil
                    </button>
                  )}
                </div>

                {/* Confirm Delete */}
                {confirmDelete && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm font-bold text-red-700 mb-3">Bu stok kaydını silmek istediğinize emin misiniz?</p>
                    <div className="flex gap-2">
                      <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium">Vazgeç</button>
                      <button onClick={handleDelete} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-bold">Evet, Sil</button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Edit Form */
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Miktar</label>
                    <input type="number" min="0" value={editForm.quantity}
                      onChange={e => setEditForm({ ...editForm, quantity: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-lg text-center" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Raf / Bölüm</label>
                    <input type="text" value={editForm.shelf}
                      onChange={e => setEditForm({ ...editForm, shelf: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lokasyon</label>
                  <select value={editForm.locationId}
                    onChange={e => setEditForm({ ...editForm, locationId: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none">
                    {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setEditing(false)} className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium">İptal</button>
                  <button onClick={handleSaveEdit} className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                    <Save size={16} /> Kaydet
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
