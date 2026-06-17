import { useState } from 'react';
import { ArrowRightLeft, CheckCircle2, ChevronRight, MapPin, Package, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Transfer() {
  const navigate = useNavigate();
  const locations = useStore(state => state.locations);
  const products = useStore(state => state.products);
  const inventory = useStore(state => state.inventory);
  const performTransfer = useStore(state => state.performTransfer);

  const [step, setStep] = useState(1);
  const [sourceLoc, setSourceLoc] = useState('');
  const [destLoc, setDestLoc] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);

  const sourceInventory = sourceLoc
    ? inventory.filter(i => i.locationId === sourceLoc && i.quantity > 0)
    : [];

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
      selectedProducts.map(p => ({ productId: p.id, transferQty: p.transferQty }))
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
                <select
                  value={sourceLoc}
                  onChange={(e) => setSourceLoc(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none text-sm"
                >
                  <option value="">Lokasyon seçin...</option>
                  {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                </select>
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

            {/* Product selector */}
            <div className="bg-white rounded-2xl card-shadow border border-slate-100/80 p-4">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Ürün Ekle</label>
              <select
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
                defaultValue=""
              >
                <option value="" disabled>Ürün seçin...</option>
                {sourceInventory.map(inv => {
                  const p = products.find(prod => prod.id === inv.productId);
                  const alreadySelected = selectedProducts.find(sp => sp.id === inv.productId);
                  return (
                    <option key={inv.id} value={inv.id} disabled={!!alreadySelected}>
                      {p?.name} ({inv.quantity} mevcut)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Selected products */}
            {selectedProducts.length > 0 ? (
              <div className="space-y-2.5">
                {selectedProducts.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-2xl card-shadow border border-slate-100/80 flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center shrink-0">
                      <Package size={19} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-slate-800 leading-tight truncate">{item.name}</h3>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Maks: {item.maxQty}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                        <button
                          onClick={() => handleQtyChange(item.id, -1)}
                          className="h-7 w-7 rounded-lg bg-white text-slate-700 font-black shadow-sm flex items-center justify-center active:scale-90 transition-transform"
                        >−</button>
                        <span className="w-7 text-center font-black text-sm">{item.transferQty}</span>
                        <button
                          onClick={() => handleQtyChange(item.id, 1)}
                          className="h-7 w-7 rounded-lg bg-white text-slate-700 font-black shadow-sm flex items-center justify-center active:scale-90 transition-transform"
                        >+</button>
                      </div>
                      <button onClick={() => handleRemoveProduct(item.id)} className="p-1.5 text-slate-300 hover:text-red-400 transition-colors">
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                <Package size={28} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">Üstten ürün seçin</p>
              </div>
            )}

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
