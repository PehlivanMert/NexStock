import { useEffect, useRef, useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useStore } from '../../store/useStore';
import { X, CheckCircle2, AlertTriangle, Flashlight, FlashlightOff } from 'lucide-react';

export default function BarcodeScanner({ onScan, onClose }) {
  const setScanning = useStore((state) => state.setScanning);
  const [scanState, setScanState] = useState('scanning'); // scanning | success | error
  const [lastScanned, setLastScanned] = useState(null);
  const [torchOn, setTorchOn] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const lastScanTime = useRef(0);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1800, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1400, audioCtx.currentTime + 0.08);
      gainNode.gain.setValueAtTime(0.35, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.18);
    } catch (e) { /* silent */ }
  };

  useEffect(() => {
    setScanning(true);
    return () => setScanning(false);
  }, [setScanning]);

  const handleScan = (detectedCodes) => {
    if (!detectedCodes || detectedCodes.length === 0) return;

    // Debounce: ignore re-scans within 1.5s of same barcode
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

    onScan(decodedText);

    setTimeout(() => {
      setScanState('scanning');
    }, 1000);
  };

  // Camera constraints - safe approach without zoom (not universally supported)
  const constraints = {
    facingMode: { ideal: 'environment' },
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    ...(torchOn ? { torch: true } : {}),
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)' }}>

      {/* ── Top Bar ────────────────────────────────────── */}
      <div className="flex justify-between items-center px-4 py-3 z-10 shrink-0">
        <button
          onClick={onClose}
          className="p-2.5 bg-black/60 backdrop-blur-sm rounded-2xl border border-white/10 text-white active:scale-90 transition-transform"
        >
          <X size={22} />
        </button>

        <div className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
          scanState === 'success'
            ? 'bg-green-500/20 border border-green-400/30 text-green-300'
            : 'bg-black/60 backdrop-blur-sm border border-white/10 text-white/70'
        }`}>
          {scanState === 'success' ? '✓ Barkod Okundu' : 'Barkodu Çerçeveleyın'}
        </div>

        <button
          onClick={() => setTorchOn(v => !v)}
          className={`p-2.5 rounded-2xl border backdrop-blur-sm text-white active:scale-90 transition-all ${
            torchOn
              ? 'bg-yellow-400/30 border-yellow-400/40 text-yellow-300'
              : 'bg-black/60 border-white/10'
          }`}
        >
          {torchOn
            ? <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6l-6 6-6-6"/><path d="M12 12v6"/><path d="M12 22v-4"/></svg>
            : <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6l-6 6-6-6"/><path d="M12 12v6"/><path d="M12 22v-4"/></svg>
          }
        </button>
      </div>

      {/* ── Camera View ──────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden">
        <Scanner
          onScan={handleScan}
          onError={(err) => {
            console.warn('Scanner error:', err);
            setScanState('error');
          }}
          formats={[
            'qr_code',
            'ean_13',
            'ean_8',
            'code_128',
            'code_39',
            'upc_a',
            'upc_e',
            'itf',
            'data_matrix',
          ]}
          constraints={{ facingMode: 'environment' }}
          allowMultiple={true}
          scanDelay={600}
          styles={{
            container: { width: '100%', height: '100%', position: 'absolute', inset: 0 },
            video: { objectFit: 'cover', width: '100%', height: '100%' },
          }}
          components={{
            audio: false,
            finder: false,
          }}
        />

        {/* Dark vignette */}
        <div className="absolute inset-0 pointer-events-none scan-vignette" />

        {/* ── Custom Finder Overlay ──── */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative" style={{ width: '75vw', maxWidth: '300px', height: '160px' }}>

            {/* Semi-dark overlay - outside the box */}
            <div className="absolute inset-0 -m-[100vw] border-[100vw] border-black/55 rounded-none" />

            {/* Corner brackets */}
            {[
              'top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-2xl',
              'top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-2xl',
              'bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-2xl',
              'bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-2xl',
            ].map((cls, i) => (
              <div
                key={i}
                className={`absolute w-9 h-9 ${cls} transition-colors duration-300 ${
                  scanState === 'success' ? 'border-green-400' : 'border-white'
                }`}
              />
            ))}

            {/* Scanning laser line */}
            {scanState === 'scanning' && (
              <div
                className="absolute left-2 right-2 h-0.5 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, transparent, #3b82f6, #60a5fa, #3b82f6, transparent)',
                  animation: 'scanline 2.5s ease-in-out infinite',
                  boxShadow: '0 0 8px rgba(59, 130, 246, 0.8)',
                  top: 0,
                }}
              />
            )}

            {/* Success overlay */}
            {scanState === 'success' && (
              <div className="absolute inset-0 bg-green-500/15 rounded-xl flex items-center justify-center animate-scale-in border border-green-400/40">
                <CheckCircle2 size={44} className="text-green-400" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Panel ────────────────────────────────── */}
      <div
        className="shrink-0 glass-dark border-t border-white/10 px-5 py-5"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 20px)' }}
      >
        {scanState === 'success' && lastScanned ? (
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="h-10 w-10 bg-green-500/20 border border-green-400/30 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle2 size={22} className="text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-green-400">Barkod Başarıyla Okundu</div>
              <div className="text-xs text-slate-400 font-mono mt-0.5 truncate">{lastScanned}</div>
            </div>
            {scanCount > 1 && (
              <span className="text-xs font-bold text-slate-400 bg-white/10 px-2 py-1 rounded-lg shrink-0">×{scanCount}</span>
            )}
          </div>
        ) : scanState === 'error' ? (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-red-500/20 border border-red-400/30 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle size={22} className="text-red-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-red-400">Kamera Erişimi Başarısız</div>
              <div className="text-xs text-slate-400 mt-0.5">Lütfen kamera izinlerini kontrol edin.</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white/80">Tarayıcı Aktif</div>
              <div className="flex items-center gap-2 mt-1.5">
                {['EAN-13', 'CODE-128', 'QR', 'UPC-A', 'ITF'].map(t => (
                  <span key={t} className="text-[10px] text-slate-500 bg-white/8 px-2 py-0.5 rounded-md font-mono">{t}</span>
                ))}
              </div>
            </div>
            {/* Pulsing indicator */}
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-primary-400 rounded-full animate-pulse" />
              <span className="text-xs text-slate-500">Taranıyor</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
