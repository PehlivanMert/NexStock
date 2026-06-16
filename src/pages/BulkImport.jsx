import { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, FileText, File, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';

export default function BulkImport() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, processing, success, error
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const bulkImportProducts = useStore(state => state.bulkImportProducts);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    setFile(selectedFile);
    setStatus('processing');
    
    // Simulate processing
    setTimeout(() => {
      setStatus('success');
    }, 2000);
  };

  const resetState = () => {
    setFile(null);
    setStatus('idle');
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <File size={48} className="text-slate-400" />;
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
      return <FileSpreadsheet size={48} className="text-green-500" />;
    }
    if (fileName.endsWith('.pdf')) {
      return <FileText size={48} className="text-red-500" />;
    }
    return <File size={48} className="text-blue-500" />; // Word/Docx
  };

  const handleSave = () => {
    // Generate some mock products to import
    const mockProductsToImport = Array.from({length: 14}).map((_, i) => ({
      name: `Toplu Ürün ${i+1}`,
      sku: `BULK-${Date.now().toString().slice(-4)}-${i}`,
      quantity: Math.floor(Math.random() * 50) + 1
    }));
    
    bulkImportProducts(mockProductsToImport);
    toast.success('14 adet ürün başarıyla stoklara eklendi.');
    navigate('/admin/inventory');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white px-4 py-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-800">Toplu Ürün Ekleme</h1>
        <p className="text-sm text-slate-500">Excel, CSV, Word veya PDF faturadan içe aktarın</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
        
        {status === 'idle' && (
          <form 
            onDragEnter={handleDrag} 
            onSubmit={(e) => e.preventDefault()}
            className="w-full max-w-md"
          >
            <input 
              ref={inputRef} 
              type="file" 
              className="hidden" 
              accept=".xlsx,.xls,.csv,.pdf,.doc,.docx" 
              onChange={handleChange} 
            />
            
            <div 
              className={`border-2 border-dashed rounded-3xl p-10 text-center transition-colors cursor-pointer flex flex-col items-center justify-center gap-4 ${
                dragActive ? 'border-primary-500 bg-primary-50' : 'border-slate-300 bg-white hover:bg-slate-50'
              }`}
              onClick={() => inputRef.current.click()}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="h-20 w-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                <UploadCloud size={40} />
              </div>
              <div>
                <p className="font-bold text-lg text-slate-800">Dosya Seçin veya Sürükleyin</p>
                <p className="text-sm text-slate-500 mt-1">Sisteme yüklenecek faturayı veya Excel listesini buraya bırakın.</p>
              </div>
              
              <div className="flex gap-4 mt-4">
                <div className="flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg"><FileSpreadsheet size={16} className="text-green-500"/> .XLSX</div>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg"><FileText size={16} className="text-red-500"/> .PDF</div>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg"><File size={16} className="text-blue-500"/> .DOCX</div>
              </div>
            </div>
          </form>
        )}

        {status === 'processing' && (
          <div className="text-center">
            <div className="animate-pulse mb-6 flex justify-center">
               {getFileIcon(file?.name)}
            </div>
            <h2 className="text-xl font-bold text-slate-800">Dosya İşleniyor...</h2>
            <p className="text-slate-500 mt-2">{file?.name}</p>
            <div className="mt-8 flex justify-center">
              <div className="h-2 w-48 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary-600 w-1/2 animate-[progress_2s_ease-in-out_infinite]"></div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4">Fatura içeriği AI ile analiz ediliyor, lütfen bekleyin.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 text-center w-full max-w-md">
            <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Analiz Tamamlandı</h2>
            <p className="text-slate-500 mt-2 mb-6"><span className="font-medium text-slate-700">14 adet ürün</span> başarıyla tespit edildi ve içe aktarılmaya hazır.</p>
            
            <div className="space-y-3">
              <button onClick={handleSave} className="w-full py-3.5 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-700">
                Stoklara Ekle
              </button>
              <button onClick={resetState} className="w-full py-3.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200">
                İptal Et
              </button>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
