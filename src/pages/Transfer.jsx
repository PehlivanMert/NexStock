import { useState } from 'react';
import { ArrowRightLeft, CheckCircle2, ChevronRight, MapPin, Package, X, Search } from 'lucide-react';
import { useStore, ROLE_PERMISSIONS } from '../store/useStore';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export default function Transfer() {
  const navigate = useNavigate();
  const location = useLocation();
  const locations = useStore(state => state.locations);
  const products = useStore(state => state.products);
  const inventory = useStore(state => state.inventory);
  const performTransfer = useStore(state => state.performTransfer);

  const user = useStore(state => state.user);
  const [step, setStep] = useState(1);
  const [sourceLoc, setSourceLoc] = useState('');
  const [destLoc, setDestLoc] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const isPrivileged = ROLE_PERMISSIONS[user?.role]?.canAccessAdmin || user?.activeLocationId === 'all';

  // Personel için kaynak lokasyonu otomatik doldur
  useEffect(() => {
    if (location.state?.autoSourceLoc && location.state?.autoProduct) {
      setSourceLoc(location.state.autoSourceLoc);
      setStep(2);
    } else if (!isPrivileged && user?.activeLocationId && user.activeLocationId !== 'all') {
      setSourceLoc(user.activeLocationId);
    }
  }, [location.state, isPrivileged, user?.activeLocationId]);

  // Auto-select product after source location is set and step 2 is active
  useEffect(() => {
    if (location.state?.autoProduct && step === 2) {
      const invItem = inventory.find(i => i.locationId === sourceLoc && i.productId === location.state.autoProduct && i.quantity > 0);
      if (invItem && !selectedProducts.find(p => p.id === location.state.autoProduct)) {
        // Find product to add
        const product = products.find(p => p.id === invItem.productId);
        if (product) {
          setSelectedProducts([{
            id: product.id, name: product.name, sku: product.sku,
            transferQty: 1, maxQty: invItem.quantity
          }]);
        }
      }
      // Clear location state to avoid re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [step, sourceLoc, inventory, products, location.state, selectedProducts]);

  const sourceInventory = sourceLoc
    ? inventory.filter(i => i.locationId === sourceLoc && i.quantity > 0)
    : [];

  const filteredSourceInventory = sourceInventory.filter(inv => {
    if (!searchTerm) return true;
    const p = products.find(prod => prod.id === inv.productId);
    return p?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
           p?.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p?.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleProductSelect = (invId) => {
    const inv = inventory.find(i => i.id === invId);
    if (!inv) return;
    if (selectedProducts.find(p => p.id === inv.productId)) return;
    const product = products.find(p => p.id === inv.productId);
    setSelectedProducts([...selectedProducts, {
      id: product.id, name: product.name, sku: product.sku,
      transferQty: 1, maxQty: inv.quantity
    }]);
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleQtyChange = (productId, delta) => {
    setSelectedProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const newQty = Math.max(1, Math.min(p.maxQty, p.transferQty + delta));
        return { ...p, transferQty: newQty };
      }
      return p;
    }));
  };

  const handleComplete = () => {
    if (selectedProducts.length === 0) return;
    performTransfer(
      sourceLoc, destLoc,
      selectedProducts.map(p => ({ 
        productId: p.id, 
        transferQty: p.transferQty,
        name: p.name,
        sku: p.sku
      }))
    );
    toast.success('Transfer İşlemi Başarılı!', {
      description: `${selectedProducts.length} ürün ${locations.find(l => l.id === destLoc)?.name} lokasyonuna gönderildi.`
    });
    setStep(3);
  };

  const steps = ['Yön', 'Ürünler', 'Tamamlandı'];
  const sourceLocName = locations.find(l => l.id === sourceLoc)?.name;
  const destLocName = locations.find(l => l.id === destLoc)?.name;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header with stepper */}
      <div className="bg-white px-4 py-4 border-b border-slate-100 shrink-0">
        <h1 className="text-xl font-extrabold text-slate-800 mb-4 tracking-tight">Stok Transferi</h1>

        {/* Step pills */}
        <div className="flex items-center gap-2">
          {steps.map((s, i) => {
            const stepNum = i + 1;
            const isDone = step > stepNum;
            const isActive = step === stepNum;
            return (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <div className={`h-0.5 flex-1 w-8 rounded-full ${step > i ? 'bg-primary-600' : 'bg-slate-200'}`} />}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isDone ? 'bg-emerald-100 text-emerald-700' :
                  isActive ? 'bg-primary-600 text-white shadow-md shadow-primary-400/30' :
                  'bg-slate-100 text-slate-400'
                }`}>
                  <span className="text-[11px]">{isDone ? '✓' : stepNum}</span>
                  <span>{s}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-8">
        {/* ── Step 1: Direction ────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in-up">
            {/* Source → Dest visual */}
            {(sourceLoc || destLoc) && (
              <div className="bg-white rounded-2xl card-shadow border border-slate-100/80 p-4 flex items-center gap-3">
                <div className={`flex-1 text-center p-3 rounded-xl ${sourceLoc ? 'bg-red-50 border border-red-100' : 'bg-slate-50'}`}>
                  <div className="text-xs text-slate-400 mb-1">Çıkış</div>
                  <div className={`text-sm font-bold ${sourceLoc ? 'text-red-700' : 'text-slate-400'}`}>
                    {sourceLocName || '—'}
                  </div>
                </div>
                <div className="h-8 w-8 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                  <ArrowRightLeft size={16} className="text-slate-500" />
                </div>
                <div className={`flex-1 text-center p-3 rounded-xl ${destLoc ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50'}`}>
                  <div className="text-xs text-slate-400 mb-1">Hedef</div>
                  <div className={`text-sm font-bold ${destLoc ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {destLocName || '—'}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl card-shadow border border-slate-100/80 p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2 mb-2">
                  <div className="h-5 w-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-[10px] font-black">C</div>
                  Çıkış Deposu
                </label>
              {/* Personel için çıkış deposu otomatik */}
              {isPrivileged ? (
                <select
                  value={sourceLoc}
                  onChange={(e) => setSourceLoc(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none text-sm"
                >
                  <option value="">Lokasyon seçin...</option>
                  {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                </select>
              ) : (
                <div className="w-full p-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-sm text-slate-700 font-medium">
                  {locations.find(l => l.id === sourceLoc)?.name || 'Lokasyon atanmamış'}
                </div>
              )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2 mb-2">
                  <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-black">H</div>
                  Hedef Lokasyon
                </label>
                <select
                  value={destLoc}
                  onChange={(e) => setDestLoc(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none text-sm"
                >
                  <option value="">Lokasyon seçin...</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id} disabled={loc.id === sourceLoc}>{loc.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!sourceLoc || !destLoc}
              className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none active:scale-98 transition-all"
            >
              Ürünleri Seç <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* ── Step 2: Products ─────────────────────────── */}
        {step === 2 && (
          <div className="space-y-3 animate-fade-in-up">
            {/* Route summary */}
            <div className="flex items-center gap-2 bg-white rounded-2xl card-shadow border border-slate-100/80 p-3 text-sm">
              <span className="font-semibold text-red-600 truncate">{sourceLocName}</span>
              <ArrowRightLeft size={14} className="text-slate-400 shrink-0" />
              <span className="font-semibold text-emerald-600 truncate">{destLocName}</span>
            </div>

            {/* Multi-Product Selector & Quantities */}
            <div className="bg-white rounded-2xl card-shadow border border-slate-100/80 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  Transfer Edilecek Ürünleri Seçin
                </label>
              </div>
              
              <div className="relative mb-3 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Ürün ara..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                {sourceInventory.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    <Package size={28} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">Bu depoda ürün bulunmuyor</p>
                  </div>
                ) : filteredSourceInventory.length === 0 ? (
                  <div className="text-center py-4 text-slate-400 text-sm">Arama sonucu bulunamadı.</div>
                ) : (
                  filteredSourceInventory.map(inv => {
                    const p = products.find(prod => prod.id === inv.productId);
                    const selectedItem = selectedProducts.find(sp => sp.id === inv.productId);
                    const isSelected = !!selectedItem;
                    return (
                      <div key={inv.id} className={`flex flex-col gap-3 p-3.5 rounded-xl border transition-all ${isSelected ? 'bg-primary-50/50 border-primary-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                        <div 
                          className="flex items-center gap-3 cursor-pointer"
                          onClick={() => {
                            if (isSelected) handleRemoveProduct(inv.productId);
                            else handleProductSelect(inv.id);
                          }}
                        >
                          <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0 ${isSelected ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-slate-300'}`}>
                            {isSelected && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5 stroke-[3]"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm text-slate-800 truncate">{p?.name || 'Bilinmeyen Ürün'}</div>
                            <div className="text-[11px] font-medium text-slate-500 mt-0.5">{inv.quantity} adet mevcut</div>
                          </div>
                        </div>
                        
                        {isSelected && (
                          <div className="flex items-center justify-between pl-8 animate-fade-in-up">
                            <span className="text-xs font-bold text-slate-600">Transfer Adedi:</span>
                            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                              <button
                                onClick={() => handleQtyChange(inv.productId, -1)}
                                className="h-8 w-8 rounded-lg bg-slate-50 text-slate-700 font-black shadow-sm flex items-center justify-center active:scale-90 transition-transform"
                              >−</button>
                              <span className="w-10 text-center font-black text-sm">{selectedItem.transferQty}</span>
                              <button
                                onClick={() => handleQtyChange(inv.productId, 1)}
                                className="h-8 w-8 rounded-lg bg-slate-50 text-slate-700 font-black shadow-sm flex items-center justify-center active:scale-90 transition-transform"
                              >+</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold active:scale-98 transition-all"
              >
                Geri
              </button>
              <button
                onClick={handleComplete}
                disabled={selectedProducts.length === 0}
                className="flex-[2] py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none active:scale-98 transition-all"
              >
                <CheckCircle2 size={19} /> Transferi Başlat
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Success ───────────────────────────── */}
        {step === 3 && (
          <div className="flex flex-col items-center text-center py-12 animate-scale-in">
            <div className="h-24 w-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-emerald-400/30">
              <CheckCircle2 size={44} className="text-white" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Transfer Başarılı!</h2>
            <p className="text-slate-500 mt-3 mb-8 leading-relaxed max-w-xs">
              <strong className="text-slate-700">{selectedProducts.length} ürün</strong>,{' '}
              <strong className="text-emerald-600">{destLocName}</strong> lokasyonuna transfer edildi.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full max-w-xs py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/30 active:scale-98 transition-all"
            >
              Ana Sayfaya Dön
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
