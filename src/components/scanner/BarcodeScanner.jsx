import { useEffect, useRef, useState, useCallback } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useStore } from '../../store/useStore';
import { X, CheckCircle2, AlertTriangle, Zap, ZapOff, ScanBarcode, Keyboard, Camera, Usb, PackageSearch } from 'lucide-react';

// Mobil cihaz tespiti
const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

export default function BarcodeScanner({ onScan, onClose, showLog = false, footerActions = null }) {
  const setScanning = useStore((state) => state.setScanning);
  const products = useStore((state) => state.products);

  const [scanState, setScanState] = useState('scanning'); // scanning | success
  const [cameraError, setCameraError] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(null);
  const [scanCount, setScanCount] = useState(0);
  const [manualInput, setManualInput] = useState('');
  
  // Kamera veya USB modu (mobilde hep kamera)
  const [mode, setMode] = useState(isMobileDevice ? 'camera' : 'usb');
  
  const [scanLog, setScanLog] = useState([]);
  const [pageVisible, setPageVisible] = useState(true);
  
  const lastScanTime = useRef(0);
  const streamRef = useRef(null);

  useEffect(() => {
    const handleVisibility = () => {
      setPageVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const BEEP_BASE64 = "data:audio/wav;base64,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";

  const playBeep = () => {
    try {
      const audio = new Audio(BEEP_BASE64);
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) { /* silent */ }
  };

  useEffect(() => {
    if (mode !== 'camera') return;
    let attempts = 0;
    const maxAttempts = 160;
    const poll = setInterval(() => {
      attempts++;
      const videoEl = document.querySelector('video');
      if (videoEl?.srcObject) {
        const stream = videoEl.srcObject;
        streamRef.current = stream;
        const track = stream.getVideoTracks()[0];
        if (track) {
          const caps = track.getCapabilities?.();
          if (caps) setTorchSupported(!!caps.torch);
          else setTorchSupported(null);
        }
        clearInterval(poll);
      } else if (attempts >= maxAttempts) {
        clearInterval(poll);
      }
    }, 50);
    return () => clearInterval(poll);
  }, [mode]);

  const applyTorch = useCallback(async (enabled) => {
    try {
      const videoEl = document.querySelector('video');
      const stream = videoEl?.srcObject || streamRef.current;
      if (stream) {
        const track = stream.getVideoTracks()[0];
        if (track) {
          const caps = track.getCapabilities?.();
          if (!caps || caps.torch !== false) {
            try {
              await track.applyConstraints({ advanced: [{ torch: enabled }] });
              setTorchSupported(true);
              return;
            } catch (e) { console.warn(e); }
          } else {
            setTorchSupported(false);
            return;
          }
        }
      }
      if (enabled) {
        try {
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' }, advanced: [{ torch: true }] },
          });
          if (videoEl) {
            videoEl.srcObject = newStream;
            streamRef.current = newStream;
          }
          setTorchSupported(true);
        } catch (e2) { setTorchSupported(false); }
      } else {
        if (stream) {
          const track = stream.getVideoTracks()[0];
          if (track) { try { await track.applyConstraints({ advanced: [{ torch: false }] }); } catch (_) {} }
        }
      }
    } catch (err) { setTorchSupported(false); }
  }, []);

  const toggleTorch = useCallback(async () => {
    const newValue = !torchOn;
    setTorchOn(newValue);
    await applyTorch(newValue);
  }, [torchOn, applyTorch]);

  useEffect(() => {
    return () => { if (torchOn) applyTorch(false); };
  }, [torchOn, applyTorch]);

  const handleScan = useCallback((detectedCodes) => {
    if (!detectedCodes || detectedCodes.length === 0) return;
    const now = Date.now();
    if (now - lastScanTime.current < 800) return;
    lastScanTime.current = now;
    const decodedText = detectedCodes[0].rawValue;
    if (!decodedText) return;
    
    if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
    playBeep();
    setScanState('success');
    setLastScanned(decodedText);
    setScanCount(c => c + 1);
    
    if (showLog) {
      // Sadece sayım (Count) modundayken log'a ekle
      const product = products.find(p => p.barcode === decodedText || p.sku === decodedText || p.id === decodedText);
      setScanLog(prev => {
        const existingIdx = prev.findIndex(item => item.barcode === decodedText);
        if (existingIdx >= 0) {
          const newList = [...prev];
          newList[existingIdx] = { ...newList[existingIdx], count: newList[existingIdx].count + 1 };
          const item = newList.splice(existingIdx, 1)[0];
          return [item, ...newList]; // En üste taşı
        }
        return [{ id: Date.now(), barcode: decodedText, product, count: 1 }, ...prev];
      });
    }

    onScan(decodedText);
    setTimeout(() => setScanState('scanning'), 1000);
  }, [onScan, products, showLog]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleScan([{ rawValue: manualInput.trim() }]);
      setManualInput('');
    }
  };

  useEffect(() => {
    let barcodeString = '';
    let lastKeyTime = Date.now();
    let timeoutId = null;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 250) barcodeString = '';

      if (e.key === 'Enter') {
        if (barcodeString.length > 2) {
          e.preventDefault();
          handleScan([{ rawValue: barcodeString }]);
        }
        barcodeString = '';
        if (timeoutId) clearTimeout(timeoutId);
      } else if (e.key.length === 1) {
        barcodeString += e.key;
        if (timeoutId) clearTimeout(timeoutId);

        // Enter göndermeyen okuyucular için otomatik onaylama
        timeoutId = setTimeout(() => {
          if (barcodeString.length > 2) {
            handleScan([{ rawValue: barcodeString }]);
            barcodeString = '';
          }
        }, 250);
      }
      lastKeyTime = currentTime;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [handleScan, onClose]);

  useEffect(() => {
    setScanning(true);
    return () => setScanning(false);
  }, [setScanning]);

  const renderManualInputForm = () => (
    <form onSubmit={handleManualSubmit} className="relative w-full">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
        <Keyboard size={18} />
      </div>
      <input
        type="text"
        value={manualInput}
        onChange={(e) => setManualInput(e.target.value)}
        placeholder="Manuel barkod..."
        className="w-full bg-black/40 border border-white/10 text-white placeholder-white/40 rounded-xl py-3.5 pl-11 pr-16 outline-none focus:bg-black/60 focus:border-blue-400/50 transition-all font-mono text-sm"
      />
      <button
        type="submit"
        disabled={!manualInput.trim()}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold disabled:opacity-0 transition-opacity active:scale-95"
      >
        GİR
      </button>
    </form>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* ── Top Bar ────────────────────────────────────── */}
      <div className="flex justify-between items-center px-4 py-3 z-10 shrink-0 bg-slate-900/80 backdrop-blur-md border-b border-white/5">
        <button
          onClick={onClose}
          className="p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-white active:scale-90 transition-all"
        >
          <X size={22} />
        </button>

        {!isMobileDevice && (
          <div className="flex bg-slate-800/80 p-1 rounded-2xl border border-white/5">
            <button
              onClick={() => setMode('camera')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'camera' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera size={14} /> Kamera
            </button>
            <button
              onClick={() => setMode('usb')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'usb' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Usb size={14} /> USB / Klavye
            </button>
          </div>
        )}

        <button
          onClick={toggleTorch}
          disabled={torchSupported === false || mode !== 'camera' || cameraError}
          className={`p-2.5 rounded-2xl border transition-all ${
            (torchSupported === false || mode !== 'camera' || cameraError)
              ? 'bg-transparent border-transparent opacity-0 pointer-events-none'
              : torchOn
              ? 'bg-yellow-400/20 border-yellow-400/40 text-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.2)]'
              : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
          }`}
          title={torchOn ? 'Flaşı Kapat' : 'Flaşı Aç'}
        >
          {torchOn ? <Zap size={22} fill="currentColor" /> : <ZapOff size={22} />}
        </button>
      </div>

      {/* ── Main Layout ──────────────────────────────────── */}
      <div className={`flex-1 flex overflow-hidden ${!isMobileDevice && showLog ? 'flex-row' : 'flex-col relative'}`}>
        
        {/* Scanner Area */}
        <div className={`relative overflow-hidden bg-black flex flex-col flex-1 ${!isMobileDevice && showLog ? 'border-r border-white/10' : ''}`}>
          {mode === 'camera' && !cameraError && pageVisible ? (
            <>
              <Scanner
                onScan={handleScan}
                onError={(err) => {
                  console.warn('Scanner error:', err);
                  setCameraError(true);
                  if (!isMobileDevice) setMode('usb');
                }}
                formats={['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e', 'itf', 'data_matrix']}
                constraints={{ facingMode: { ideal: 'environment' }, width: { min: 640, ideal: 1280, max: 1920 }, height: { min: 480, ideal: 720, max: 1080 } }}
                allowMultiple={true}
                scanDelay={400}
                styles={{ container: { width: '100%', height: '100%', position: 'absolute', inset: 0 }, video: { objectFit: 'cover', width: '100%', height: '100%' } }}
                components={{ audio: false, finder: false }}
              />
              <div className="absolute inset-0 pointer-events-none scan-vignette" />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative" style={{ width: '75vw', maxWidth: '300px', height: '160px' }}>
                  <div className="absolute inset-0 -m-[100vw] border-[100vw] border-black/55 rounded-none" />
                  {['top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-2xl', 'top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-2xl', 'bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-2xl', 'bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-2xl'].map((cls, i) => (
                    <div key={i} className={`absolute w-9 h-9 ${cls} transition-colors duration-300 ${scanState === 'success' ? 'border-green-400' : 'border-white'}`} />
                  ))}
                  {scanState === 'scanning' && (
                    <div className="absolute left-2 right-2 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg, transparent, #3b82f6, #60a5fa, #3b82f6, transparent)', animation: 'scanline 2.5s ease-in-out infinite', boxShadow: '0 0 8px rgba(59, 130, 246, 0.8)', top: 0 }} />
                  )}
                  {scanState === 'success' && (
                    <div className="absolute inset-0 bg-green-500/15 rounded-xl flex items-center justify-center animate-scale-in border border-green-400/40">
                      <CheckCircle2 size={44} className="text-green-400" />
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-900 relative z-10">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="h-16 w-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                  <ScanBarcode size={32} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">USB & Manuel Mod</h3>
                <p className="text-slate-400 max-w-[280px] text-xs leading-relaxed">
                  Fiziksel barkod okuyucunuzla okutma yapabilir veya barkodu manuel girebilirsiniz.
                </p>
              </div>
            </div>
          )}
          
          {/* If showLog is false, just render the manual input at the bottom of the scanner area */}
          {!showLog && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-900/80 backdrop-blur-md border-t border-white/5 z-20" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}>
              {renderManualInputForm()}
            </div>
          )}
        </div>

        {/* Scan Log Area (Desktop: Right Panel, Mobile: Bottom Sheet Area) */}
        {showLog && (
          <div className={`flex flex-col ${!isMobileDevice ? 'bg-slate-900 flex-[1.5] min-w-[350px] max-w-[600px]' : 'z-20 h-[48vh] shrink-0 bg-slate-950 border-t border-white/10 shadow-[0_-15px_40px_rgba(0,0,0,0.5)] rounded-t-3xl relative -mt-5'}`}>
            {/* Grab handle for mobile visual */}
            {isMobileDevice && (
              <div className="w-full flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-12 h-1.5 bg-white/20 rounded-full" />
              </div>
            )}
            <div className={`px-4 pb-4 border-b border-white/10 shrink-0 ${!isMobileDevice ? 'pt-4' : 'pt-2'}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <PackageSearch size={18} className="text-blue-400" /> Okutulanlar
                </h3>
                {scanLog.length > 0 && (
                  <span className="bg-white/15 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-sm">
                    TOPLAM: {scanLog.reduce((acc, curr) => acc + curr.count, 0)}
                  </span>
                )}
              </div>
              {footerActions && (
                <div className="mt-4">
                  {footerActions}
                </div>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {scanLog.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center opacity-60">
                  <ScanBarcode size={32} className="mb-3" />
                  <p className="text-xs font-semibold">Henüz ürün okutulmadı</p>
                </div>
              ) : (
                scanLog.map((log) => (
                  <div key={log.id} className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3 animate-fade-in-up">
                    <div className="h-10 w-10 bg-slate-800 rounded-xl flex items-center justify-center shrink-0 border border-white/5">
                      <span className="text-sm font-black text-white">{log.count}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{log.product?.name || 'Bilinmeyen Ürün'}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">{log.barcode}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Manual Input Bottom Bar - rendered within the log area if showLog is true */}
            <div className="p-4 bg-slate-900/80 backdrop-blur-md border-t border-white/5 shrink-0" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}>
              {renderManualInputForm()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
