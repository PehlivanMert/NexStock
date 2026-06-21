import { useState, useEffect } from 'react';
import { ScanBarcode, Save, MapPin, CheckCircle, Minus, Plus, ClipboardCheck, Search } from 'lucide-react';
import { useStore } from '../store/useStore';
import BarcodeScanner from '../components/scanner/BarcodeScanner';
import { toast } from 'sonner';

export default function Count() {
  const locations = useStore(state => state.locations);
  const products = useStore(state => state.products);
  const inventory = useStore(state => state.inventory);
  const updateInventoryCount = useStore(state => state.updateInventoryCount);
  const saveCountLog = useStore(state => state.saveCountLog);

  const [selectedLocation, setSelectedLocation] = useState('');
  const [countingData, setCountingData] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'scanned', 'diff'

  useEffect(() => {
    if (!selectedLocation) { setCountingData([]); return; }

    const locInventory = inventory.filter(inv => inv.locationId === selectedLocation);
    const mappedData = locInventory.map(inv => {
      const product = products.find(p => p.id === inv.productId);
      return {
        id: inv.id, productId: inv.productId,
        name: product?.name || 'Bilinmeyen Ürün',
        sku: product?.sku || '-',
        expected: inv.quantity, counted: 0,
      };
    });
    setCountingData(mappedData);
  }, [selectedLocation, inventory, products]);

  const handleCountChange = (productId, newCount) => {
    setCountingData(prev => prev.map(item =>
      item.productId === productId ? { ...item, counted: Math.max(0, parseInt(newCount) || 0) } : item
    ));
  };

  const handleSaveReport = () => {
    const countedItems = countingData.filter(item => item.counted > 0);
    if (countedItems.length === 0) { toast.error('Kaydedilecek okutulmuş ürün yok.'); return; }
    saveCountLog(selectedLocation, countedItems);
    toast.success('Sayım Raporu kaydedildi!');
    setCountingData(prev => prev.map(item => ({ ...item, counted: 0 })));
  };

  const handleSyncInventory = () => {
    const countedItems = countingData.filter(item => item.counted > 0);
    if (countedItems.length === 0) { toast.error('Senkronize edilecek okutulmuş ürün yok.'); return; }
    if (!window.confirm('Okuttuğunuz değerler sistem stoklarının üzerine yazılacak. Onaylıyor musunuz?')) return;
    countedItems.forEach(item => updateInventoryCount(selectedLocation, item.productId, item.counted));
    saveCountLog(selectedLocation, countedItems);
    toast.success('Stoklar başarıyla senkronize edildi!');
    setCountingData(prev => prev.map(item => ({ ...item, counted: 0 })));
  };

  const handleScan = (barcode) => {
    const product = products.find(p => p.barcode === barcode || p.sku === barcode || p.id === barcode);
    if (!product) {
      toast.error('Bu barkoda ait ürün sistemde bulunamadı!');
      return;
    }
    const inList = countingData.find(c => c.productId === product.id);
    if (inList) {
      setCountingData(prev => prev.map(item =>
        item.productId === product.id ? { ...item, counted: item.counted + 1 } : item
      ));
      toast.success(`${product.name} — Toplam: ${inList.counted + 1}`, { duration: 1500 });
    } else {
      toast.error('Bu ürün mevcut lokasyona ait değil.');
    }
  };

  if (isScanning) {
    return <BarcodeScanner onScan={handleScan} onClose={() => setIsScanning(false)} />;
  }

  const scannedCount = countingData.filter(i => i.counted > 0).length;
  const hasDiscrepancy = countingData.some(i => i.counted > 0 && i.counted !== i.expected);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-slate-100 shrink-0">
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight mb-3">Depo Sayımı</h1>

        <div className="flex items-center gap-2.5 bg-slate-50 rounded-2xl border border-slate-200 px-3.5 py-2.5">
          <MapPin size={16} className="text-slate-400 shrink-0" />
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="flex-1 bg-transparent text-slate-700 text-sm font-medium outline-none"
          >
            <option value="">Lokasyon seçin...</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>

        {/* Stats bar */}
        {selectedLocation && (
          <div className="flex gap-2 mt-3">
            <button onClick={() => setFilterMode('scanned')} className={`flex-1 rounded-xl p-2 text-center border-2 transition-all ${filterMode === 'scanned' ? 'bg-primary-100 border-primary-500' : 'bg-primary-50 border-transparent hover:border-primary-200'}`}>
              <div className="text-lg font-black text-primary-700">{scannedCount}</div>
              <div className="text-[10px] text-primary-500 font-medium">Okutuldu</div>
            </button>
            <button onClick={() => setFilterMode('all')} className={`flex-1 rounded-xl p-2 text-center border-2 transition-all ${filterMode === 'all' ? 'bg-slate-200 border-slate-500' : 'bg-slate-100 border-transparent hover:border-slate-300'}`}>
              <div className="text-lg font-black text-slate-700">{countingData.length}</div>
              <div className="text-[10px] text-slate-500 font-medium">Tümü</div>
            </button>
            {hasDiscrepancy && (
              <button onClick={() => setFilterMode('diff')} className={`flex-1 rounded-xl p-2 text-center border-2 transition-all ${filterMode === 'diff' ? 'bg-orange-100 border-orange-500' : 'bg-orange-50 border-transparent hover:border-orange-200'}`}>
                <div className="text-lg font-black text-orange-600">
                  {countingData.filter(i => i.counted > 0 && i.counted !== i.expected).length}
                </div>
                <div className="text-[10px] text-orange-500 font-medium">Fark Var</div>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Scan button */}
        <button
          onClick={() => {
            if (!selectedLocation) { toast.error('Önce lokasyon seçin'); return; }
            setIsScanning(true);
          }}
          className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-primary-500/30 active:scale-98 transition-all font-bold text-base"
        >
          <ScanBarcode size={24} />
          Barkod Okut
        </button>

        {selectedLocation ? (
          scannedCount === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200">
              <ClipboardCheck size={32} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-semibold text-slate-500">Henüz ürün okutulmadı</p>
              <p className="text-xs text-slate-400 mt-1">Barkod Okut butonuna basın</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="relative mb-4">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Sayım listesinde ara..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 rounded-xl outline-none text-sm card-shadow transition-all"
                />
              </div>

              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Sayım Listesi</h3>
              {countingData.filter(item => {
                if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase()) && !item.sku.toLowerCase().includes(searchTerm.toLowerCase())) return false;
                if (filterMode === 'scanned' && item.counted === 0) return false;
                if (filterMode === 'diff' && (item.counted === 0 || item.counted === item.expected)) return false;
                return true;
              }).map((item) => {
                const diff = item.counted - item.expected;
                const isMatch = diff === 0;
                const isMissing = diff < 0;
                const isExcess = diff > 0;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border card-shadow ${
                      isMatch ? 'bg-white border-slate-100/80' :
                      isMissing ? 'bg-red-50 border-red-100' :
                      'bg-amber-50 border-amber-100'
                    } animate-fade-in-up`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm truncate">{item.name}</h4>
                        <span className="text-xs text-slate-400 font-mono">{item.sku}</span>
                      </div>
                      {!isMatch && (
                        <span className={`ml-2 text-xs font-black px-2.5 py-1 rounded-full shrink-0 ${
                          isMissing ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {diff > 0 ? `+${diff} Fazla` : `${diff} Eksik`}
                        </span>
                      )}
                      {isMatch && (
                        <CheckCircle size={18} className="text-emerald-500 ml-2 shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-500">
                        Sistem: <span className="font-black text-slate-700">{item.expected}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-medium">Sayılan:</span>
                        <div className="flex items-center gap-1.5 bg-white rounded-xl border border-slate-200 p-1">
                          <button
                            onClick={() => handleCountChange(item.productId, item.counted - 1)}
                            className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-black active:scale-90 transition-transform"
                          >
                            <Minus size={14} />
                          </button>
                          <input
                            type="number"
                            value={item.counted}
                            onChange={(e) => handleCountChange(item.productId, e.target.value)}
                            className="w-10 text-center font-black text-base bg-transparent outline-none"
                          />
                          <button
                            onClick={() => handleCountChange(item.productId, item.counted + 1)}
                            className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-black active:scale-90 transition-transform"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <MapPin size={28} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-semibold text-slate-500">Lokasyon seçilmedi</p>
            <p className="text-xs text-slate-400 mt-1">Sayıma başlamak için üstten lokasyon seçin</p>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0 flex gap-3">
        <button
          onClick={handleSaveReport}
          disabled={!selectedLocation || scannedCount === 0}
          className="flex-1 py-3.5 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-semibold flex justify-center items-center gap-2 hover:bg-slate-50 disabled:opacity-40 transition-all active:scale-98 text-sm"
        >
          <Save size={18} /> Rapor Kaydet
        </button>
        <button
          onClick={handleSyncInventory}
          disabled={!selectedLocation || scannedCount === 0}
          className="flex-1 py-3.5 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-2xl font-bold shadow-md flex justify-center items-center gap-2 hover:from-slate-700 hover:to-slate-800 disabled:opacity-40 transition-all active:scale-98 text-sm"
        >
          <CheckCircle size={18} /> Stoku Güncelle
        </button>
      </div>
    </div>
  );
}
