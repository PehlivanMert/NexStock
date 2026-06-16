import { useState } from 'react';
import { ArrowRightLeft, CheckCircle2, ChevronRight, MapPin, Package } from 'lucide-react';
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
  
  // Start with empty selected products
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Available products in source location
  const sourceInventory = sourceLoc ? inventory.filter(i => i.locationId === sourceLoc && i.quantity > 0) : [];

  const handleProductSelect = (invId) => {
    const inv = inventory.find(i => i.id === invId);
    if (!inv) return;

    if (selectedProducts.find(p => p.id === inv.productId)) return; // Already selected
    
    const product = products.find(p => p.id === inv.productId);
    setSelectedProducts([...selectedProducts, { 
      id: product.id, 
      name: product.name, 
      sku: product.sku, 
      transferQty: 1, 
      maxQty: inv.quantity 
    }]);
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
      sourceLoc,
      destLoc,
      selectedProducts.map(p => ({ productId: p.id, transferQty: p.transferQty }))
    );

    toast.success('Transfer İşlemi Başarılı!', {
      description: `${selectedProducts.length} farklı ürün, ${locations.find(l => l.id === destLoc)?.name} lokasyonuna gönderildi.`
    });
    setStep(3);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white px-4 py-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-800">Stok Transferi</h1>
        <div className="flex items-center gap-2 mt-3 mb-1">
          <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-primary-600' : 'bg-slate-200'}`}></div>
          <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-primary-600' : 'bg-slate-200'}`}></div>
          <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-primary-600' : 'bg-slate-200'}`}></div>
        </div>
        <div className="flex justify-between text-xs font-medium text-slate-500 px-1">
          <span className={step >= 1 ? 'text-primary-600' : ''}>Yön</span>
          <span className={step >= 2 ? 'text-primary-600' : ''}>Ürünler</span>
          <span className={step >= 3 ? 'text-primary-600' : ''}>Onay</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative">
              <div className="absolute left-8 top-[3.5rem] bottom-8 w-0.5 bg-slate-200 z-0"></div>
              
              <div className="relative z-10 space-y-6">
                <div>
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center border-2 border-white shadow-sm"><ArrowRightLeft size={12} /></div>
                    Çıkış Deposu
                  </label>
                  <select 
                    value={sourceLoc}
                    onChange={(e) => setSourceLoc(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="">Seçiniz...</option>
                    {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center border-2 border-white shadow-sm"><MapPin size={12} /></div>
                    Hedef Depo/Mağaza
                  </label>
                  <select 
                    value={destLoc}
                    onChange={(e) => setDestLoc(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="">Seçiniz...</option>
                    {locations.map(loc => <option key={loc.id} value={loc.id} disabled={loc.id === sourceLoc}>{loc.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              disabled={!sourceLoc || !destLoc}
              className="w-full py-3.5 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Devam Et <ChevronRight size={20} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-slate-100 p-3 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-500 block mb-1">Eklenecek Ürün Seçin</label>
              <select 
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
                defaultValue=""
              >
                <option value="" disabled>Ürün Seçin...</option>
                {sourceInventory.map(inv => {
                  const p = products.find(prod => prod.id === inv.productId);
                  return <option key={inv.id} value={inv.id}>{p?.name} (Mevcut: {inv.quantity})</option>
                })}
              </select>
            </div>

            {selectedProducts.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
                <div className="h-10 w-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center shrink-0">
                  <Package size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-slate-800 leading-tight">{item.name}</h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{item.sku}</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                  <button onClick={() => handleQtyChange(item.id, -1)} className="h-7 w-7 rounded bg-white text-slate-700 font-bold shadow-sm hover:bg-slate-100 flex items-center justify-center">-</button>
                  <span className="w-6 text-center font-bold text-sm">{item.transferQty}</span>
                  <button onClick={() => handleQtyChange(item.id, 1)} className="h-7 w-7 rounded bg-white text-slate-700 font-bold shadow-sm hover:bg-slate-100 flex items-center justify-center">+</button>
                </div>
              </div>
            ))}

            <div className="pt-4 flex gap-3">
              <button 
                onClick={() => setStep(1)}
                className="flex-1 py-3.5 bg-slate-200 text-slate-700 rounded-xl font-bold"
              >
                Geri
              </button>
              <button 
                onClick={handleComplete}
                disabled={selectedProducts.length === 0}
                className="flex-[2] py-3.5 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Transferi Başlat
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 text-center mt-8">
            <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Transfer Başlatıldı</h2>
            <p className="text-slate-500 mt-2 mb-6">
              Seçilen ürünler <strong>{locations.find(l => l.id === destLoc)?.name}</strong> lokasyonuna yola çıktı.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="w-full py-3.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700"
            >
              Ana Sayfaya Dön
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
