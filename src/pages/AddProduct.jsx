import { useState } from 'react';
import { ScanBarcode, Plus, Image as ImageIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import BarcodeScanner from '../components/scanner/BarcodeScanner';
import { toast } from 'sonner';

export default function AddProduct() {
  const navigate = useNavigate();
  const location = useLocation();
  const locations = useStore(state => state.locations);
  const addProduct = useStore(state => state.addProduct);
  const [isScanning, setIsScanning] = useState(false);
  const [formData, setFormData] = useState({
    name: '', sku: '', barcode: location.state?.barcode || '', quantity: '', locationId: '', shelf: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!formData.locationId) {
      toast.error('Lütfen bir lokasyon seçin.');
      return;
    }
    
    addProduct(
      { name: formData.name, sku: formData.sku, barcode: formData.barcode },
      formData.locationId,
      parseInt(formData.quantity) || 0,
      formData.shelf
    );
    
    toast.success('Ürün başarıyla eklendi!');
    navigate(-1);
  };

  if (isScanning) {
    return (
      <BarcodeScanner 
        onScan={(code) => { setFormData({ ...formData, barcode: code }); setIsScanning(false); }} 
        onClose={() => setIsScanning(false)} 
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white px-4 py-4 border-b border-slate-200 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Yeni Ürün Ekle</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center">
            <div className="h-24 w-24 bg-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-300">
              <ImageIcon size={32} />
              <span className="text-xs font-medium mt-1">Fotoğraf</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ürün Adı</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Örn: iPhone 15 Kılıf"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Barkod / QR</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={formData.barcode}
                onChange={e => setFormData({...formData, barcode: e.target.value})}
                className="flex-1 p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-mono"
                placeholder="Okutun veya yazın"
              />
              <button type="button" onClick={() => setIsScanning(true)} className="p-3 bg-primary-100 text-primary-600 rounded-xl hover:bg-primary-200">
                <ScanBarcode size={24} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stok Kodu (SKU)</label>
              <input 
                type="text" 
                value={formData.sku}
                onChange={e => setFormData({...formData, sku: e.target.value})}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-mono text-sm"
                placeholder="IP15-KLF"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Miktar</label>
              <input 
                required
                type="number" 
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: e.target.value})}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lokasyon</label>
            <select 
              required
              value={formData.locationId}
              onChange={e => setFormData({...formData, locationId: e.target.value})}
              className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="">Depo/Mağaza Seçin</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Raf / Bölüm</label>
            <input 
              type="text" 
              value={formData.shelf}
              onChange={e => setFormData({...formData, shelf: e.target.value})}
              className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Örn: A-15"
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 flex justify-center items-center gap-2"
            >
              <Plus size={20} />
              Ürünü Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
