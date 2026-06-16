import { useState, useEffect } from 'react';
import { ScanBarcode, Save, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function Count() {
  const locations = useStore(state => state.locations);
  const products = useStore(state => state.products);
  const inventory = useStore(state => state.inventory);
  const updateInventoryCount = useStore(state => state.updateInventoryCount);
  
  const [selectedLocation, setSelectedLocation] = useState('');
  const [countingData, setCountingData] = useState([]);

  // Filter inventory based on selected location
  useEffect(() => {
    if (!selectedLocation) {
      setCountingData([]);
      return;
    }

    const locInventory = inventory.filter(inv => inv.locationId === selectedLocation);
    const mappedData = locInventory.map(inv => {
      const product = products.find(p => p.id === inv.productId);
      return {
        id: inv.id,
        productId: inv.productId,
        name: product?.name || 'Bilinmeyen Ürün',
        sku: product?.sku || '-',
        expected: inv.quantity,
        counted: inv.quantity, // Default to expected, user modifies this
      };
    });
    setCountingData(mappedData);
  }, [selectedLocation, inventory, products]);

  const handleCountChange = (productId, newCount) => {
    setCountingData(prev => prev.map(item => 
      item.productId === productId ? { ...item, counted: parseInt(newCount) || 0 } : item
    ));
  };

  const handleSave = () => {
    countingData.forEach(item => {
      if (item.counted !== item.expected) {
        updateInventoryCount(selectedLocation, item.productId, item.counted);
      }
    });
    alert("Sayım başarıyla kaydedildi ve stoklar güncellendi!");
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white px-4 py-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-800 mb-2">Depo Sayım</h1>
        
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-slate-400 shrink-0" />
          <select 
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-primary-500 outline-none p-2"
          >
            <option value="">Sayım yapılacak lokasyonu seçin...</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Link to="/scan" className="w-full py-4 bg-primary-600 text-white rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-primary-500/30 active:scale-95 transition-transform">
          <ScanBarcode size={24} />
          <span className="font-bold text-lg">Barkod Okut</span>
        </Link>

        {selectedLocation ? (
          <div className="space-y-3 mt-4">
            <h3 className="font-semibold text-slate-700 px-1">Sayım Listesi</h3>
            
            {countingData.length === 0 ? (
              <p className="text-slate-500 text-sm p-4 text-center bg-white rounded-xl border border-slate-200">
                Bu lokasyonda listelenmiş ürün bulunamadı.
              </p>
            ) : (
              countingData.map((item) => {
                const diff = item.counted - item.expected;
                const isMatch = diff === 0;
                const isMissing = diff < 0;
                
                return (
                  <div key={item.id} className={`p-4 rounded-xl border ${isMatch ? 'bg-white border-slate-200' : isMissing ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-slate-800">{item.name}</h4>
                        <span className="text-xs text-slate-500 font-mono">{item.sku}</span>
                      </div>
                      {diff !== 0 && (
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${isMissing ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {diff > 0 ? `+${diff} Fazla` : `${diff} Eksik`}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="text-sm text-slate-500">Sistem: <span className="font-bold text-slate-700">{item.expected}</span></div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleCountChange(item.productId, item.counted - 1)} className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold hover:bg-slate-300">-</button>
                        <input 
                          type="number" 
                          value={item.counted}
                          onChange={(e) => handleCountChange(item.productId, e.target.value)}
                          className="w-16 text-center font-bold text-lg bg-transparent border-b-2 border-slate-300 focus:border-primary-500 outline-none"
                        />
                        <button onClick={() => handleCountChange(item.productId, item.counted + 1)} className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold hover:bg-slate-300">+</button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
            Lütfen sayıma başlamak için üstten bir lokasyon seçin.
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <button 
          onClick={handleSave}
          disabled={!selectedLocation || countingData.length === 0}
          className="w-full py-3 bg-slate-800 text-white rounded-xl font-medium shadow-md flex justify-center items-center gap-2 hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save size={20} />
          <span>Sayımı Kaydet</span>
        </button>
      </div>
    </div>
  );
}
