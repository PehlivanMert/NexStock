import { Package, Search, Plus, X, Edit2, Trash2, Save, SlidersHorizontal } from 'lucide-react';
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
  const [filterCritical, setFilterCritical] = useState(false);

  const combinedData = inventory
    .filter(inv => inv.locationId === user?.activeLocationId)
    .map(inv => {
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

  const filteredData = combinedData
    .filter(item =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barcode.includes(searchTerm)
    )
    .filter(item => filterCritical ? item.quantity < 10 : true);

  const criticalCount = combinedData.filter(i => i.quantity < 10).length;

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

      {/* ── Search Bar ─────────────────────────────────── */}
      <div className="bg-white px-4 pt-3 pb-3 border-b border-slate-100 shrink-0">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ürün, SKU veya barkod ara..."
            className="w-full pl-10 pr-10 py-3 bg-slate-100 border border-transparent focus:bg-white focus:border-primary-500/30 focus:ring-2 focus:ring-primary-500/10 rounded-2xl transition-all outline-none text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mt-2.5">
          <span className="text-xs text-slate-500 font-medium">{filteredData.length} kayıt</span>
          {criticalCount > 0 && (
            <button
              onClick={() => setFilterCritical(v => !v)}
              className={`ml-1 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                filterCritical
                  ? 'bg-red-500 text-white shadow-sm shadow-red-400/30'
                  : 'bg-red-50 text-red-600 border border-red-200'
              }`}
            >
              <span>{criticalCount} kritik</span>
            </button>
          )}
          {(searchTerm || filterCritical) && (
            <button
              onClick={() => { setSearchTerm(''); setFilterCritical(false); }}
              className="ml-auto text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
            >
              <X size={12} /> Temizle
            </button>
          )}
        </div>
      </div>

      {/* ── List ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 pb-28">
        {filteredData.length === 0 ? (
          <div className="text-center py-16">
            <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package size={28} className="text-slate-300" />
            </div>
            <p className="font-semibold text-slate-500">Ürün bulunamadı</p>
            <p className="text-sm text-slate-400 mt-1">Arama kriterlerini değiştirin</p>
          </div>
        ) : (
          filteredData.map((item, i) => (
            <div
              key={item.id}
              onClick={() => openProduct(item)}
              className="bg-white p-4 rounded-2xl card-shadow border border-slate-100/80 flex items-center gap-3.5 cursor-pointer active:scale-98 transition-all animate-fade-in-up"
              style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
            >
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                item.quantity < 10 ? 'bg-red-50' : 'bg-slate-100'
              }`}>
                <Package size={22} className={item.quantity < 10 ? 'text-red-500' : 'text-slate-400'} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 truncate text-sm">{item.productName}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">{item.sku}</p>
                <div className="text-[11px] text-primary-600 font-semibold mt-1">{item.locationName}</div>
              </div>
              <div className="text-right shrink-0">
                <div className={`font-black text-xl leading-none ${item.quantity < 10 ? 'text-red-600' : 'text-slate-800'}`}>
                  {item.quantity}
                </div>
                {item.shelf && (
                  <div className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-1 inline-block">{item.shelf}</div>
                )}
                {item.quantity < 10 && (
                  <div className="text-[9px] text-red-500 font-black mt-0.5 uppercase tracking-wide">Kritik</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── FAB ─────────────────────────────────────────── */}
      {perms.canDeleteInventory && (
        <Link
          to="/add"
          className="absolute bottom-20 right-4 h-14 w-14 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary-500/40 active:scale-90 transition-all z-10"
        >
          <Plus size={26} />
        </Link>
      )}

      {/* ── Product Detail Sheet ─────────────────────────── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-in-bottom">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 bg-slate-200 rounded-full" />
            </div>

            <div className="px-5 pb-8 pt-2">
              {/* Header */}
              <div className="flex justify-between items-start mb-5">
                <div className="flex gap-3 items-center">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${
                    selectedProduct.quantity < 10 ? 'bg-red-50' : 'bg-slate-100'
                  }`}>
                    <Package size={26} className={selectedProduct.quantity < 10 ? 'text-red-500' : 'text-slate-400'} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 leading-tight">{selectedProduct.productName}</h2>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">{selectedProduct.sku}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="p-2 bg-slate-100 text-slate-500 rounded-xl active:scale-90 transition-transform">
                  <X size={18} />
                </button>
              </div>

              {!editing ? (
                <>
                  <div className="space-y-3">
                    <div className={`flex justify-between items-center p-4 rounded-2xl ${
                      selectedProduct.quantity < 10 ? 'bg-red-50 border border-red-100' : 'bg-slate-50'
                    }`}>
                      <span className="text-sm font-semibold text-slate-600">Mevcut Stok</span>
                      <span className={`text-3xl font-black ${selectedProduct.quantity < 10 ? 'text-red-600' : 'text-slate-800'}`}>
                        {selectedProduct.quantity}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 bg-slate-50 rounded-2xl">
                        <span className="text-xs text-slate-500 block mb-1 font-medium">Lokasyon</span>
                        <span className="text-sm font-bold text-slate-800">{selectedProduct.locationName}</span>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-2xl">
                        <span className="text-xs text-slate-500 block mb-1 font-medium">Raf / Bölüm</span>
                        <span className="text-sm font-bold text-slate-800">{selectedProduct.shelf || '-'}</span>
                      </div>
                    </div>
                    {selectedProduct.barcode && selectedProduct.barcode !== '-' && (
                      <div className="p-3.5 bg-slate-50 rounded-2xl">
                        <span className="text-xs text-slate-500 block mb-1 font-medium">Barkod</span>
                        <span className="text-sm font-mono font-bold text-slate-800">{selectedProduct.barcode}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-5">
                    {perms.canDeleteInventory && (
                      <button
                        onClick={() => setEditing(true)}
                        className="flex-1 py-3.5 bg-primary-50 text-primary-600 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                      >
                        <Edit2 size={16} /> Düzenle
                      </button>
                    )}
                    {perms.canDeleteInventory && (
                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="py-3.5 px-5 bg-red-50 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {confirmDelete && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl animate-scale-in">
                      <p className="text-sm font-bold text-red-700 mb-3">Bu stok kaydını silmek istediğinize emin misiniz?</p>
                      <div className="flex gap-2">
                        <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-semibold">Vazgeç</button>
                        <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold">Evet, Sil</button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Miktar</label>
                      <input
                        type="number" min="0" value={editForm.quantity}
                        onChange={e => setEditForm({ ...editForm, quantity: e.target.value })}
                        className="w-full p-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none font-black text-xl text-center bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Raf</label>
                      <input
                        type="text" value={editForm.shelf}
                        onChange={e => setEditForm({ ...editForm, shelf: e.target.value })}
                        className="w-full p-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none bg-slate-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Lokasyon</label>
                    <select
                      value={editForm.locationId}
                      onChange={e => setEditForm({ ...editForm, locationId: e.target.value })}
                      className="w-full p-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none bg-slate-50"
                    >
                      {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button onClick={() => setEditing(false)} className="flex-1 py-3.5 border border-slate-200 text-slate-600 rounded-2xl font-semibold">İptal</button>
                    <button onClick={handleSaveEdit} className="flex-1 py-3.5 bg-primary-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20">
                      <Save size={16} /> Kaydet
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
