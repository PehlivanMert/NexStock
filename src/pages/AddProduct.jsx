import { useState } from 'react';
import { ScanBarcode, Plus, Package, Barcode, MapPin, Hash, Tag, Save } from 'lucide-react';
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
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '', sku: '', barcode: location.state?.barcode || '',
    quantity: '', locationId: '', shelf: '', price: ''
  });

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e, stayOnPage = false) => {
    e.preventDefault();
    if (!formData.locationId) { toast.error('Lütfen bir lokasyon seçin.'); return; }
    setSaving(true);
    try {
      await addProduct(
        { name: formData.name, sku: formData.sku, barcode: formData.barcode, price: parseFloat(formData.price) || 0 },
        formData.locationId,
        parseInt(formData.quantity) || 0,
        formData.shelf
      );
      toast.success('Ürün başarıyla eklendi!');
      if (!stayOnPage) {
        navigate(-1);
      } else {
        setFormData(prev => ({ ...prev, name: '', sku: '', barcode: '', quantity: '', price: '' }));
        toast.info('Yeni ürün eklemeye devam edebilirsiniz.');
      }
    } catch (err) {
      toast.error('Kayıt başarısız: ' + err.message);
    }
    setSaving(false);
  };

  if (isScanning) {
    return (
      <BarcodeScanner
        onScan={(code) => { update('barcode', code); setIsScanning(false); }}
        onClose={() => setIsScanning(false)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex-1 overflow-y-auto p-4 pb-8">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Barcode highlight ────────────────────── */}
          {formData.barcode && (
            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 flex items-center gap-3 animate-scale-in">
              <div className="h-10 w-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                <Barcode size={20} className="text-primary-600" />
              </div>
              <div>
                <div className="text-xs text-primary-600 font-bold mb-0.5">Barkod Tarandı</div>
                <div className="font-mono font-bold text-primary-800 text-sm">{formData.barcode}</div>
              </div>
            </div>
          )}

          {/* Product Name */}
          <FormSection icon={Tag} label="Ürün Adı" required>
            <input
              required type="text"
              value={formData.name}
              onChange={e => update('name', e.target.value)}
              className="field-input"
              placeholder="Örn: iPhone 15 Kılıf"
            />
          </FormSection>

          {/* Barcode */}
          <FormSection icon={Barcode} label="Barkod / QR">
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.barcode}
                onChange={e => update('barcode', e.target.value)}
                className="field-input flex-1 font-mono"
                placeholder="Okutun veya yazın"
              />
              <button
                type="button"
                onClick={() => setIsScanning(true)}
                className="p-3.5 bg-primary-100 text-primary-600 rounded-2xl hover:bg-primary-200 active:scale-90 transition-all"
              >
                <ScanBarcode size={22} />
              </button>
            </div>
          </FormSection>

          {/* SKU + Quantity + Price */}
          <div className="grid grid-cols-2 gap-3">
            <FormSection icon={Hash} label="SKU">
              <input
                type="text"
                value={formData.sku}
                onChange={e => update('sku', e.target.value)}
                className="field-input font-mono text-sm"
                placeholder="IP15-KLF"
              />
            </FormSection>
            <FormSection label="Miktar" required>
              <input
                required type="number"
                value={formData.quantity}
                onChange={e => update('quantity', e.target.value)}
                className="field-input font-black text-lg text-center"
                placeholder="0"
                min="0"
              />
            </FormSection>
          </div>

          {/* Price */}
          <FormSection label="Satış Fiyatı (TL)">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">₺</span>
              <input
                type="number"
                value={formData.price}
                onChange={e => update('price', e.target.value)}
                className="field-input pl-8 font-bold"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </FormSection>

          {/* Location */}
          <FormSection icon={MapPin} label="Lokasyon" required>
            <select
              required
              value={formData.locationId}
              onChange={e => update('locationId', e.target.value)}
              className="field-input"
            >
              <option value="">Depo / Mağaza seçin</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </FormSection>

          {/* Shelf */}
          <FormSection icon={Package} label="Raf / Bölüm">
            <input
              type="text"
              value={formData.shelf}
              onChange={e => update('shelf', e.target.value)}
              className="field-input"
              placeholder="Örn: A-15"
            />
          </FormSection>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={saving}
              className="flex-1 py-4 bg-white border-2 border-primary-100 text-primary-600 hover:bg-primary-50 rounded-2xl font-bold flex justify-center items-center gap-2 active:scale-98 transition-all disabled:opacity-60"
            >
              <Plus size={18} /> Yeni Ekle
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              disabled={saving}
              className="flex-[1.5] py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/30 flex justify-center items-center gap-2.5 active:scale-98 transition-all disabled:opacity-60"
            >
              {saving ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
              {saving ? 'Kaydediliyor...' : 'Kaydet & Çık'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .field-input {
          width: 100%;
          padding: 0.875rem 1rem;
          background: white;
          border: 1.5px solid #e2e8f0;
          border-radius: 1rem;
          outline: none;
          font-family: inherit;
          font-size: 0.875rem;
          transition: all 0.15s ease;
          color: #0f172a;
        }
        .field-input:focus {
          border-color: #93c5fd;
          box-shadow: 0 0 0 3px rgba(147, 197, 253, 0.2);
        }
      `}</style>
    </div>
  );
}

function FormSection({ icon: Icon, label, required, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
        {Icon && <Icon size={12} className="text-slate-400" />}
        {label}
        {required && <span className="text-red-400 text-base leading-none">*</span>}
      </label>
      {children}
    </div>
  );
}
