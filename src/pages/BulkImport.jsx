import { useState, useRef } from 'react';
import {
  UploadCloud, FileSpreadsheet, FileText, File, CheckCircle2,
  AlertCircle, MapPin, Package, X, Download, ArrowRight, Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

// ── Format column mapping ─────────────────────────────────────────────────────
// Tries to detect standard column names in multiple languages
const COL = {
  name:     ['ad', 'adi', 'name', 'ürün adı', 'product', 'product name', 'urun'],
  sku:      ['sku', 'kod', 'code', 'stok kodu', 'item code', 'product code', 'stock code'],
  barcode:  ['barkod', 'barcode', 'ean', 'gtin'],
  quantity: ['miktar', 'adet', 'qty', 'quantity', 'stok', 'stock', 'amount'],
  shelf:    ['raf', 'shelf', 'location', 'lokasyon', 'bölüm', 'section'],
};

function detectCol(header, candidates) {
  const h = header?.toString().toLowerCase().trim();
  return candidates.some(c => h?.includes(c));
}

function parseRows(worksheet) {
  const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  if (!json.length) return [];

  const headers = Object.keys(json[0]);

  const nameKey     = headers.find(h => detectCol(h, COL.name));
  const skuKey      = headers.find(h => detectCol(h, COL.sku));
  const barcodeKey  = headers.find(h => detectCol(h, COL.barcode));
  const quantityKey = headers.find(h => detectCol(h, COL.quantity));
  const shelfKey    = headers.find(h => detectCol(h, COL.shelf));

  return json
    .map((row, i) => ({
      name:     (nameKey ? String(row[nameKey]) : '').trim() || `Ürün ${i + 1}`,
      sku:      (skuKey ? String(row[skuKey]) : '').trim() || '',
      barcode:  (barcodeKey ? String(row[barcodeKey]) : '').trim() || '-',
      quantity: parseInt(quantityKey ? row[quantityKey] : 10) || 0,
      shelf:    (shelfKey ? String(row[shelfKey]) : '').trim() || 'Toplu Aktarım',
    }))
    .filter(r => r.name && r.name !== 'Ürün 0');
}

function parseCsv(text) {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  // Auto-detect delimiter
  const delimiters = [';', ',', '\t', '|'];
  const firstLine = lines[0];
  const delimiter = delimiters.find(d => firstLine.split(d).length > 2) || ',';

  const headers = firstLine.split(delimiter).map(h => h.replace(/"/g, '').trim());
  const nameKey     = headers.findIndex(h => detectCol(h, COL.name));
  const skuKey      = headers.findIndex(h => detectCol(h, COL.sku));
  const barcodeKey  = headers.findIndex(h => detectCol(h, COL.barcode));
  const quantityKey = headers.findIndex(h => detectCol(h, COL.quantity));
  const shelfKey    = headers.findIndex(h => detectCol(h, COL.shelf));

  return lines.slice(1).map((line, i) => {
    const cols = line.split(delimiter).map(c => c.replace(/"/g, '').trim());
    return {
      name:     (nameKey >= 0 ? cols[nameKey] : '').trim() || `Ürün ${i + 1}`,
      sku:      (skuKey >= 0 ? cols[skuKey] : '').trim() || '',
      barcode:  (barcodeKey >= 0 ? cols[barcodeKey] : '').trim() || '-',
      quantity: parseInt(quantityKey >= 0 ? cols[quantityKey] : '10') || 0,
      shelf:    (shelfKey >= 0 ? cols[shelfKey] : '').trim() || 'Toplu Aktarım',
    };
  }).filter(r => r.name.trim());
}

// ── Template download ─────────────────────────────────────────────────────────
function downloadTemplate() {
  const templateData = [
    { 'Ürün Adı': 'iPhone 15 Pro', 'SKU': 'IP15P-256', 'Barkod': '1234567890', 'Miktar': 25, 'Raf': 'A-01' },
    { 'Ürün Adı': 'MacBook Air M2', 'SKU': 'MBA-M2-512', 'Barkod': '9876543210', 'Miktar': 10, 'Raf': 'B-02' },
    { 'Ürün Adı': 'AirPods Pro 2', 'SKU': 'APP2-WHT', 'Barkod': '4561237890', 'Miktar': 50, 'Raf': 'C-03' },
  ];
  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ürünler');
  // Column widths
  ws['!cols'] = [{ wch: 25 }, { wch: 18 }, { wch: 16 }, { wch: 10 }, { wch: 10 }];
  XLSX.writeFile(wb, 'NexStock_Toplu_Aktarim_Sablonu.xlsx');
  toast.success('Şablon indirildi!', { description: 'NexStock_Toplu_Aktarim_Sablonu.xlsx' });
}

// ─────────────────────────────────────────────────────────────────────────────

export default function BulkImport() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | processing | preview | error
  const [parsedRows, setParsedRows] = useState([]);
  const [parseError, setParseError] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const bulkImportProducts = useStore(state => state.bulkImportProducts);
  const locations = useStore(state => state.locations).filter(l => l.status === 'active');

  // ── File handling ──────────────────────────────────────────────
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  const handleFile = (selectedFile) => {
    setFile(selectedFile);
    setStatus('processing');
    setParseError('');

    const ext = selectedFile.name.split('.').pop().toLowerCase();

    if (ext === 'csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const rows = parseCsv(e.target.result);
          if (rows.length === 0) throw new Error('Dosyada geçerli ürün satırı bulunamadı.');
          setParsedRows(rows);
          setStatus('preview');
        } catch (err) {
          setParseError(err.message || 'CSV dosyası okunamadı.');
          setStatus('error');
        }
      };
      reader.onerror = () => { setParseError('Dosya okunamadı.'); setStatus('error'); };
      reader.readAsText(selectedFile, 'UTF-8');
    } else if (['xlsx', 'xls'].includes(ext)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target.result, { type: 'array' });
          const wsName = wb.SheetNames[0];
          const ws = wb.Sheets[wsName];
          const rows = parseRows(ws);
          if (rows.length === 0) throw new Error('Dosyada geçerli ürün satırı bulunamadı. Şablon formatına uygun olduğundan emin olun.');
          setParsedRows(rows);
          setStatus('preview');
        } catch (err) {
          setParseError(err.message || 'Excel dosyası okunamadı.');
          setStatus('error');
        }
      };
      reader.onerror = () => { setParseError('Dosya okunamadı.'); setStatus('error'); };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      // PDF/DOC: cannot truly parse, show warning
      setParseError('PDF ve Word dosyaları otomatik ayrıştırılamaz. Lütfen Excel (.xlsx) veya CSV formatında bir dosya yükleyin.');
      setStatus('error');
    }
  };

  const resetState = () => {
    setFile(null);
    setStatus('idle');
    setParsedRows([]);
    setParseError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleSave = () => {
    if (!selectedLocation) {
      toast.error('Lütfen bir lokasyon seçin.');
      return;
    }
    bulkImportProducts(parsedRows, selectedLocation);
    toast.success(`${parsedRows.length} ürün başarıyla stoklara eklendi!`, {
      description: `${locations.find(l => l.id === selectedLocation)?.name} lokasyonuna aktarıldı.`
    });
    navigate('/admin/inventory');
  };

  const removeRow = (idx) => setParsedRows(prev => prev.filter((_, i) => i !== idx));
  const updateQty = (idx, val) => setParsedRows(prev =>
    prev.map((r, i) => i === idx ? { ...r, quantity: Math.max(0, parseInt(val) || 0) } : r)
  );

  const fileExt = file?.name?.split('.').pop().toLowerCase();
  const FileIcon = ['xlsx', 'xls', 'csv'].includes(fileExt)
    ? FileSpreadsheet
    : fileExt === 'pdf' ? FileText : File;
  const fileIconColor = ['xlsx', 'xls', 'csv'].includes(fileExt)
    ? 'text-emerald-500' : fileExt === 'pdf' ? 'text-red-500' : 'text-blue-500';

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Toplu Ürün Aktarımı</h1>
          <p className="text-slate-500 mt-1 text-sm">Excel veya CSV formatında ürün listesi yükleyin.</p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition-colors text-sm card-shadow"
        >
          <Download size={16} /> Şablon İndir
        </button>
      </div>

      {/* ── Format Info Card ───────────────────────────────────── */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <FileSpreadsheet size={18} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-blue-800 mb-1">Desteklenen Sütun Adları</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-blue-700">
              <span><strong>Ad:</strong> Ürün Adı, Name, Ad</span>
              <span><strong>SKU:</strong> SKU, Kod, Code, Stok Kodu</span>
              <span><strong>Barkod:</strong> Barkod, Barcode, EAN</span>
              <span><strong>Miktar:</strong> Miktar, Adet, Qty, Stock</span>
              <span><strong>Raf:</strong> Raf, Shelf, Bölüm</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── IDLE: Drop Zone ───────────────────────────────────── */}
      {status === 'idle' && (
        <form onDragEnter={handleDrag} onSubmit={e => e.preventDefault()}>
          <input
            ref={inputRef} type="file"
            className="hidden"
            accept=".xlsx,.xls,.csv"
            onChange={handleChange}
          />
          <div
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer flex flex-col items-center gap-5 transition-all ${
              dragActive
                ? 'border-primary-400 bg-primary-50 scale-[1.01]'
                : 'border-slate-200 bg-white hover:border-primary-300 hover:bg-slate-50'
            }`}
            onClick={() => inputRef.current?.click()}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className={`h-20 w-20 rounded-2xl flex items-center justify-center transition-all ${
              dragActive ? 'bg-primary-100' : 'bg-slate-100'
            }`}>
              <UploadCloud size={36} className={dragActive ? 'text-primary-500' : 'text-slate-400'} />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-700">
                {dragActive ? 'Dosyayı Bırakın' : 'Dosya Seçin veya Sürükleyin'}
              </p>
              <p className="text-sm text-slate-400 mt-1.5">Excel ve CSV dosyaları desteklenir</p>
            </div>
            <div className="flex gap-3">
              {[
                { Icon: FileSpreadsheet, ext: '.XLSX', color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-100' },
                { Icon: FileSpreadsheet, ext: '.CSV', color: 'text-blue-500', bg: 'bg-blue-50 border-blue-100' },
                { Icon: FileSpreadsheet, ext: '.XLS', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
              ].map(({ Icon, ext, color, bg }) => (
                <div key={ext} className={`flex items-center gap-1.5 text-xs font-bold text-slate-500 ${bg} border px-3 py-2 rounded-xl`}>
                  <Icon size={14} className={color} /> {ext}
                </div>
              ))}
            </div>
          </div>
        </form>
      )}

      {/* ── PROCESSING ────────────────────────────────────────── */}
      {status === 'processing' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 card-shadow p-12 text-center">
          <div className="animate-pulse mb-6 flex justify-center">
            <FileIcon size={56} className={fileIconColor} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Dosya Analiz Ediliyor...</h2>
          <p className="text-slate-400 mt-2 text-sm">{file?.name}</p>
          <div className="mt-8 h-2 w-56 bg-slate-100 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full animate-[shimmer_1.5s_ease-in-out_infinite] w-2/3" />
          </div>
          <p className="text-xs text-slate-400 mt-4">Sütunlar otomatik eşleştiriliyor...</p>
        </div>
      )}

      {/* ── ERROR ─────────────────────────────────────────────── */}
      {status === 'error' && (
        <div className="bg-white rounded-2xl border border-red-100 card-shadow p-8 text-center">
          <div className="h-16 w-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={30} className="text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-red-700 mb-2">Dosya Okunamadı</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">{parseError}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={resetState} className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors">
              Tekrar Dene
            </button>
            <button onClick={downloadTemplate} className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center gap-2">
              <Download size={16} /> Şablon İndir
            </button>
          </div>
        </div>
      )}

      {/* ── PREVIEW ───────────────────────────────────────────── */}
      {status === 'preview' && parsedRows.length > 0 && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-4">
            <div className="h-11 w-11 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle2 size={22} className="text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-emerald-800">
                {parsedRows.length} ürün başarıyla algılandı
              </p>
              <p className="text-xs text-emerald-600 mt-0.5 truncate">
                {file?.name}
              </p>
            </div>
            <button onClick={resetState} className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors shrink-0">
              <X size={16} />
            </button>
          </div>

          {/* Location selector */}
          <div className="bg-white rounded-2xl border border-slate-200/80 card-shadow p-4">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
              <MapPin size={16} className="text-primary-500" />
              Aktarılacak Lokasyon <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {locations.map(loc => (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                    selectedLocation === loc.id
                      ? 'border-primary-400 bg-primary-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-black ${
                    selectedLocation === loc.id ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {loc.name.charAt(0)}
                  </div>
                  <div>
                    <p className={`text-sm font-bold leading-none ${selectedLocation === loc.id ? 'text-primary-700' : 'text-slate-700'}`}>
                      {loc.name}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {loc.type === 'warehouse' ? '📦 Depo' : '🏪 Mağaza'}
                    </p>
                  </div>
                  {selectedLocation === loc.id && (
                    <CheckCircle2 size={16} className="text-primary-500 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Product preview table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 card-shadow overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Package size={16} className="text-primary-500" />
                Ürün Önizlemesi
              </h3>
              <span className="text-xs text-slate-400 font-medium">{parsedRows.length} kayıt</span>
            </div>

            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-100 sticky top-0">
                  <tr>
                    {['Ürün Adı', 'SKU', 'Barkod', 'Miktar', 'Raf', ''].map(h => (
                      <th key={h} className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-2.5 font-semibold text-slate-800 max-w-[180px] truncate">{row.name}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{row.sku || '—'}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-slate-400">{row.barcode || '—'}</td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number" min="0"
                          value={row.quantity}
                          onChange={e => updateQty(i, e.target.value)}
                          className="w-16 text-center font-bold border border-slate-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none bg-white"
                        />
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 text-xs">{row.shelf}</td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => removeRow(i)}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Toplam stok: <strong className="text-slate-600">{parsedRows.reduce((s, r) => s + r.quantity, 0).toLocaleString('tr-TR')}</strong> adet
              </span>
              <button
                onClick={resetState}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Farklı dosya yükle
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={resetState}
              className="flex-1 py-3.5 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedLocation}
              className="flex-[2] py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/25 hover:from-primary-400 hover:to-primary-500 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2.5"
            >
              <Plus size={18} />
              {parsedRows.length} Ürünü Stoklara Ekle
              <ArrowRight size={16} className="opacity-70" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
