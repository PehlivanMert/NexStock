import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BarcodeScanner from '../components/scanner/BarcodeScanner';
import { useStore } from '../store/useStore';
import { Package, ArrowRightLeft, ClipboardList, RotateCcw, X } from 'lucide-react';

export default function ScannerPage() {
  const navigate = useNavigate();
  const [scannedData, setScannedData] = useState(null);
  const [scannedProduct, setScannedProduct] = useState(null);

  const products = useStore(state => state.products);
  const inventory = useStore(state => state.inventory);
  const locations = useStore(state => state.locations);

  const handleScan = (barcode) => {
    // Look up product by barcode in store
    const product = products.find(p => p.barcode === barcode || p.sku === barcode || p.id === barcode);
    setScannedData(barcode);

    if (product) {
      // Get all inventory records for this product
      const invRecords = inventory
        .filter(inv => inv.productId === product.id)
        .map(inv => ({
          ...inv,
          locationName: locations.find(l => l.id === inv.locationId)?.name || '-',
        }));

      setScannedProduct({ ...product, invRecords });
    } else {
      setScannedProduct(null);
    }
  };

  const handleClose = () => navigate(-1);

  if (scannedData) {
    return (
      <div className="flex flex-col h-full bg-slate-50">
        {/* Header */}
        <div className="bg-white px-4 py-4 border-b border-slate-200 flex items-center justify-between">
          <h1 className="font-bold text-slate-800">Tarama Sonucu</h1>
          <button onClick={handleClose} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {scannedProduct ? (
            <>
              {/* Product Found */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4 mb-5">
                  <div className="h-16 w-16 bg-green-100 rounded-2xl flex items-center justify-center">
                    <Package size={32} className="text-green-600" />
                  </div>
                  <div>
                    <div className="text-xs text-green-600 font-bold mb-0.5">✓ Ürün Bulundu</div>
                    <h2 className="text-xl font-bold text-slate-800">{scannedProduct.name}</h2>
                    <p className="text-sm font-mono text-slate-500">{scannedProduct.sku}</p>
                  </div>
                </div>

                {/* Stock by location */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-700 mb-2">Stok Durumu</h3>
                  {scannedProduct.invRecords.length > 0 ? (
                    scannedProduct.invRecords.map(inv => (
                      <div key={inv.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div>
                          <div className="text-sm font-medium text-slate-700">{inv.locationName}</div>
                          <div className="text-xs text-slate-500">Raf: {inv.shelf}</div>
                        </div>
                        <div className={`text-xl font-bold ${inv.quantity < 10 ? 'text-red-600' : 'text-slate-800'}`}>
                          {inv.quantity}
                          {inv.quantity < 10 && <span className="text-xs text-red-500 ml-1">⚠</span>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-slate-500 text-sm py-4">Bu ürün henüz stoklara eklenmemiş.</div>
                  )}
                </div>

                <div className="text-xs text-slate-400 font-mono mt-4 text-center border-t border-slate-100 pt-3">
                  Barkod: {scannedData}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => navigate('/transfer')}
                  className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col items-center gap-2 active:scale-95 transition-transform"
                >
                  <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                    <ArrowRightLeft size={20} />
                  </div>
                  <span className="text-xs font-medium text-slate-700">Transfer</span>
                </button>
                <button
                  onClick={() => navigate('/count')}
                  className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col items-center gap-2 active:scale-95 transition-transform"
                >
                  <div className="h-10 w-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                    <ClipboardList size={20} />
                  </div>
                  <span className="text-xs font-medium text-slate-700">Sayım</span>
                </button>
                <button
                  onClick={() => { setScannedData(null); setScannedProduct(null); }}
                  className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col items-center gap-2 active:scale-95 transition-transform"
                >
                  <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                    <RotateCcw size={20} />
                  </div>
                  <span className="text-xs font-medium text-slate-700">Yeniden Tara</span>
                </button>
              </div>
            </>
          ) : (
            /* Product Not Found */
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
              <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package size={32} className="text-orange-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Ürün Bulunamadı</h2>
              <p className="text-slate-500 text-sm mb-2">Bu barkoda sahip ürün sistemde kayıtlı değil.</p>
              <p className="text-xs font-mono text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg inline-block mb-6">{scannedData}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setScannedData(null); setScannedProduct(null); }}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium"
                >
                  Yeniden Tara
                </button>
                <button
                  onClick={() => navigate('/add', { state: { barcode: scannedData } })}
                  className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/30"
                >
                  Ürün Ekle
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <BarcodeScanner onScan={handleScan} onClose={handleClose} />;
}
