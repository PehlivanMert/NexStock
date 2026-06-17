import { useState } from 'react';
import BarcodeScanner from '../components/scanner/BarcodeScanner';
import { useStore } from '../store/useStore';
import { Package, ArrowRightLeft, ClipboardList, RotateCcw, X, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ScannerPage() {
  const navigate = useNavigate();
  const [scannedData, setScannedData] = useState(null);
  const [scannedProduct, setScannedProduct] = useState(null);

  const products = useStore(state => state.products);
  const inventory = useStore(state => state.inventory);
  const locations = useStore(state => state.locations);

  const handleScan = (barcode) => {
    const product = products.find(p => p.barcode === barcode || p.sku === barcode || p.id === barcode);
    setScannedData(barcode);

    if (product) {
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
  const handleRescan = () => { setScannedData(null); setScannedProduct(null); };

  if (scannedData) {
    const totalQty = scannedProduct?.invRecords?.reduce((s, r) => s + r.quantity, 0) || 0;
    const hasCritical = scannedProduct?.invRecords?.some(r => r.quantity < 10);

    return (
      <div className="flex flex-col h-full bg-slate-50">
        {/* Result Header */}
        <div className={`px-4 py-5 ${scannedProduct ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-orange-900 to-slate-900'}`}>
          <div className="flex items-center gap-4">
            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 ${
              scannedProduct ? 'bg-green-500/20 border border-green-400/30' : 'bg-orange-500/20 border border-orange-400/30'
            }`}>
              {scannedProduct
                ? <CheckCircle2 size={32} className="text-green-400" />
                : <AlertCircle size={32} className="text-orange-400" />
              }
            </div>
            <div className="flex-1 min-w-0">
              {scannedProduct ? (
                <>
                  <div className="text-xs text-green-400 font-bold mb-0.5">✓ Ürün Bulundu</div>
                  <h1 className="text-xl font-black text-white leading-tight truncate">{scannedProduct.name}</h1>
                  <p className="text-sm font-mono text-slate-400 mt-0.5">{scannedProduct.sku}</p>
                </>
              ) : (
                <>
                  <div className="text-xs text-orange-400 font-bold mb-0.5">Sistemde Kayıtlı Değil</div>
                  <h1 className="text-xl font-black text-white leading-tight">Ürün Bulunamadı</h1>
                  <p className="text-xs font-mono text-slate-400 mt-1 bg-white/10 px-2 py-0.5 rounded inline-block">{scannedData}</p>
                </>
              )}
            </div>
            <button onClick={handleClose} className="p-2 bg-white/10 text-white rounded-xl active:scale-90 transition-transform">
              <X size={20} />
            </button>
          </div>

          {/* Total stock badge */}
          {scannedProduct && (
            <div className="flex gap-2 mt-4">
              <div className={`flex-1 bg-white/10 rounded-xl p-3 text-center border ${hasCritical ? 'border-red-400/30' : 'border-white/10'}`}>
                <div className={`text-2xl font-black ${hasCritical ? 'text-red-400' : 'text-white'}`}>{totalQty}</div>
                <div className="text-xs text-slate-400 mt-0.5">toplam adet</div>
              </div>
              <div className="flex-1 bg-white/10 rounded-xl p-3 text-center border border-white/10">
                <div className="text-2xl font-black text-white">{scannedProduct.invRecords?.length || 0}</div>
                <div className="text-xs text-slate-400 mt-0.5">lokasyon</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {scannedProduct ? (
            <>
              {/* Stock by location */}
              <div className="bg-white rounded-2xl card-shadow border border-slate-100/80 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-800">Stok Durumu</h2>
                </div>
                {scannedProduct.invRecords?.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {scannedProduct.invRecords.map(inv => (
                      <div key={inv.id} className="flex items-center justify-between px-4 py-3.5">
                        <div>
                          <div className="text-sm font-semibold text-slate-800">{inv.locationName}</div>
                          <div className="text-xs text-slate-400 mt-0.5">Raf: <span className="font-mono font-semibold">{inv.shelf || '-'}</span></div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-black ${inv.quantity < 10 ? 'text-red-600' : 'text-slate-800'}`}>
                            {inv.quantity}
                          </div>
                          {inv.quantity < 10 && (
                            <div className="text-[9px] text-red-500 font-black uppercase">Kritik ⚠</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-slate-400 text-sm py-8">Bu ürün henüz stoklara eklenmemiş.</div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { label: 'Transfer', icon: ArrowRightLeft, path: '/transfer', gradient: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-400/30' },
                  { label: 'Sayım', icon: ClipboardList, path: '/count', gradient: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-400/30' },
                  { label: 'Yeniden Tara', icon: RotateCcw, action: handleRescan, gradient: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-400/30' },
                ].map((item) => {
                  const Icon = item.icon;
                  const El = item.action ? 'button' : 'div';
                  return (
                    <El
                      key={item.label}
                      onClick={item.action || (() => navigate(item.path))}
                      className="touch-active bg-white p-4 rounded-2xl border border-slate-100/80 card-shadow flex flex-col items-center gap-2.5 cursor-pointer"
                    >
                      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg ${item.shadow} flex items-center justify-center`}>
                        <Icon size={22} className="text-white" strokeWidth={1.8} />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 text-center">{item.label}</span>
                    </El>
                  );
                })}
              </div>
            </>
          ) : (
            /* Product Not Found */
            <div className="bg-white p-6 rounded-2xl card-shadow border border-slate-100/80 text-center animate-scale-in">
              <p className="text-slate-500 text-sm mb-6">Bu barkoda sahip ürün sistemde kayıtlı değil.</p>
              <div className="flex gap-3">
                <button
                  onClick={handleRescan}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-2xl font-semibold active:scale-95 transition-transform"
                >
                  Yeniden Tara
                </button>
                <button
                  onClick={() => navigate('/add', { state: { barcode: scannedData } })}
                  className="flex-1 py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/30 flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                >
                  Ürün Ekle <ChevronRight size={16} />
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
