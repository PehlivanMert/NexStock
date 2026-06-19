import { Package, Search, Plus, X, Edit2, Trash2, Save, SlidersHorizontal, CheckSquare, Square, MoreVertical, MapPin, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore, ROLE_PERMISSIONS } from '../store/useStore';
import { useState, useMemo, useRef } from 'react';
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
  
  // Filtering & Sorting
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ shelf: '', location: '', status: '' });
  const [sortBy, setSortBy] = useState('name_asc');

  // Multi-select mode
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [bulkEditForm, setBulkEditForm] = useState({ shelf: '', locationId: '' });

  const pressTimer = useRef(null);

  const combinedData = useMemo(() => {
    return inventory
      .filter(inv => user?.activeLocationId === 'all' ? true : inv.locationId === user?.activeLocationId)
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
  }, [inventory, products, locations, user?.activeLocationId]);

  const uniqueShelves = [...new Set(combinedData.map(i => i.shelf).filter(Boolean))];
  const activeLocations = locations.filter(l => l.status === 'active');

  const filteredData = useMemo(() => {
    let data = combinedData.filter(item =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barcode.includes(searchTerm)
    );

    if (filters.shelf) data = data.filter(item => item.shelf === filters.shelf);
    if (filters.location) data = data.filter(item => item.locationId === filters.location);
    if (filters.status === 'critical') data = data.filter(item => item.quantity < 10);
    else if (filters.status === 'out_of_stock') data = data.filter(item => item.quantity === 0);

    data.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc': return a.productName.localeCompare(b.productName);
        case 'name_desc': return b.productName.localeCompare(a.productName);
        case 'qty_asc': return a.quantity - b.quantity;
        case 'qty_desc': return b.quantity - a.quantity;
        default: return 0;
      }
    });

    return data;
  }, [combinedData, searchTerm, filters, sortBy]);

  const handleTouchStart = (item) => {
    if (selectMode) return;
    pressTimer.current = setTimeout(() => {
      setSelectMode(true);
      toggleSelection(item.id);
      navigator.vibrate?.(50);
    }, 600); // 600ms long press
  };

  const handleTouchEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const toggleSelection = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredData.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredData.map(i => i.id)));
  };

  const cancelSelection = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const handleBulkEditSave = async () => {
    const updates = {};
    if (bulkEditForm.shelf) updates.shelf = bulkEditForm.shelf;
    if (bulkEditForm.locationId) updates.locationId = bulkEditForm.locationId;
    
    if (Object.keys(updates).length === 0) {
      toast.error('Değişiklik yapılmadı');
      return;
    }
    
    // In a real scenario, use a bulk method from useStore to avoid multiple writes
    // Here we loop and update sequentially. We can rely on updateInventoryItem.
    for (const id of Array.from(selectedIds)) {
      await updateInventoryItem(id, updates);
    }
    toast.success(`${selectedIds.size} ürün başarıyla güncellendi!`);
    setShowBulkEdit(false);
    cancelSelection();
  };

  const openProduct = (item) => {
    if (selectMode) {
      toggleSelection(item.id);
      return;
    }
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

      {/* ── Search Bar & Selection Header ─────────────────────────────────── */}
      <div className="bg-white px-4 pt-3 pb-3 border-b border-slate-100 shrink-0">
        {!selectMode ? (
          <>
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ürün, SKU veya barkod..."
                  className="w-full pl-10 pr-10 py-3 bg-slate-100 border border-transparent focus:bg-white focus:border-primary-500/30 focus:ring-2 focus:ring-primary-500/10 rounded-2xl transition-all outline-none text-sm"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"><X size={16} /></button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(true)}
                className={`p-3 rounded-2xl border transition-colors flex items-center justify-center shrink-0 ${
                  Object.values(filters).some(v => v) || sortBy !== 'name_asc'
                    ? 'bg-primary-50 border-primary-200 text-primary-600'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <SlidersHorizontal size={20} />
              </button>
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-slate-500 font-medium">{filteredData.length} kayıt</span>
              <button onClick={() => setSelectMode(true)} className="text-xs text-primary-600 font-bold flex items-center gap-1.5 hover:text-primary-700">
                <CheckSquare size={14} /> Seçim Modu
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between py-1 animate-fade-in">
            <div className="flex items-center gap-3">
              <button onClick={cancelSelection} className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl"><X size={20} /></button>
              <div className="font-bold text-slate-800">{selectedIds.size} Seçildi</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={selectAll} className="text-xs font-bold text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-100">
                {selectedIds.size === filteredData.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
              </button>
              {selectedIds.size > 0 && perms.canDeleteInventory && (
                <button onClick={() => setShowBulkEdit(true)} className="text-xs font-bold bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 shadow-md">
                  Toplu Düzenle
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── List ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 pb-28">
        {filteredData.length === 0 ? (
          <div className="text-center py-16">
            <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package size={28} className="text-slate-300" />
            </div>
            <p className="font-semibold text-slate-500">Ürün bulunamadı</p>
          </div>
        ) : (
          filteredData.map((item, i) => {
            const isSelected = selectedIds.has(item.id);
            return (
              <div
                key={item.id}
                onClick={() => openProduct(item)}
                onTouchStart={() => handleTouchStart(item)}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchEnd}
                className={`bg-white p-4 rounded-2xl card-shadow border flex items-center gap-3.5 cursor-pointer active:scale-98 transition-all animate-fade-in-up ${
                  isSelected ? 'border-primary-400 bg-primary-50/50' : 'border-slate-100/80 hover:border-slate-200'
                }`}
              >
                {selectMode && (
                  <div className="shrink-0">
                    {isSelected ? <CheckSquare size={20} className="text-primary-600" /> : <Square size={20} className="text-slate-300" />}
                  </div>
                )}
                
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
            );
          })
        )}
      </div>

      {/* ── FAB ─────────────────────────────────────────── */}
      {!selectMode && perms.canDeleteInventory && (
        <Link
          to="/add"
          className="absolute bottom-20 right-4 h-14 w-14 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary-500/40 active:scale-90 transition-all z-10"
        >
          <Plus size={26} />
        </Link>
      )}

      {/* ── Filter & Sort Modal ──────────────────────────── */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowFilters(false)}>
          <div className="bg-white w-full max-w-md rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-in-bottom" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Filtrele ve Sırala</h2>
              <button onClick={() => setShowFilters(false)} className="p-2 bg-slate-100 text-slate-500 rounded-xl"><X size={18} /></button>
            </div>
            
            <div className="p-5 space-y-5">
              {/* Sort */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Sıralama</label>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-primary-500/20 text-sm">
                  <option value="name_asc">Ürün Adı (A-Z)</option>
                  <option value="name_desc">Ürün Adı (Z-A)</option>
                  <option value="qty_asc">Stok Miktarı (Artan)</option>
                  <option value="qty_desc">Stok Miktarı (Azalan)</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Durum</label>
                <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-primary-500/20 text-sm">
                  <option value="">Tümü</option>
                  <option value="critical">Kritik Stok ( &lt; 10 )</option>
                  <option value="out_of_stock">Tükenenler ( 0 )</option>
                </select>
              </div>

              {/* Shelf */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Raf / Bölüm</label>
                <select value={filters.shelf} onChange={e => setFilters(p => ({ ...p, shelf: e.target.value }))} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-primary-500/20 text-sm">
                  <option value="">Tüm Raflar</option>
                  {uniqueShelves.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Location (Admin/Manager) */}
              {user?.activeLocationId === 'all' && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Depo / Mağaza</label>
                  <select value={filters.location} onChange={e => setFilters(p => ({ ...p, location: e.target.value }))} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-primary-500/20 text-sm">
                    <option value="">Tüm Lokasyonlar</option>
                    {activeLocations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => { setFilters({ shelf: '', location: '', status: '' }); setSortBy('name_asc'); }} className="flex-1 py-3.5 border border-slate-200 text-slate-600 rounded-xl font-bold">Temizle</button>
                <button onClick={() => setShowFilters(false)} className="flex-1 py-3.5 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20">Sonuçları Gör</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk Edit Modal ─────────────────────────────── */}
      {showBulkEdit && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowBulkEdit(false)}>
          <div className="bg-white w-full max-w-md rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-in-bottom" onClick={e => e.stopPropagation()}>
             <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Toplu Düzenle ({selectedIds.size} ürün)</h2>
              <button onClick={() => setShowBulkEdit(false)} className="p-2 bg-slate-100 text-slate-500 rounded-xl"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Yeni Raf / Bölüm</label>
                <input
                  type="text" value={bulkEditForm.shelf} onChange={e => setBulkEditForm(p => ({ ...p, shelf: e.target.value }))}
                  placeholder="Boş bırakırsanız değişmez"
                  className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-primary-500/20 text-sm"
                />
              </div>
              {user?.activeLocationId === 'all' && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Yeni Lokasyon</label>
                  <select value={bulkEditForm.locationId} onChange={e => setBulkEditForm(p => ({ ...p, locationId: e.target.value }))} className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-primary-500/20 text-sm">
                    <option value="">Boş bırakırsanız değişmez</option>
                    {activeLocations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                 <button onClick={() => setShowBulkEdit(false)} className="flex-1 py-3.5 border border-slate-200 text-slate-600 rounded-xl font-bold">İptal</button>
                 <button onClick={handleBulkEditSave} className="flex-1 py-3.5 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 flex justify-center items-center gap-2"><Save size={16}/> Kaydet</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Product Detail Sheet ─────────────────────────── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white w-full max-w-md rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-in-bottom" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 bg-slate-200 rounded-full" />
            </div>

            <div className="px-5 pb-8 pt-2">
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
                      {activeLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
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
