import { useEffect, useRef, useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useStore } from '../../store/useStore';
import { X, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function BarcodeScanner({ onScan, onClose }) {
  const setScanning = useStore((state) => state.setScanning);
  const [scanState, setScanState] = useState('scanning'); // scanning | success | error
  const [lastScanned, setLastScanned] = useState(null);
  const lastScanTime = useRef(0);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) { /* silent */ }
  };

  useEffect(() => {
    setScanning(true);
    return () => setScanning(false);
  }, []);

  const handleScan = (detectedCodes) => {
    if (!detectedCodes || detectedCodes.length === 0) return;
    
    const decodedText = detectedCodes[0].rawValue;

    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    playBeep();
    setScanState('success');
    setLastScanned(decodedText);

    // Pass to parent
    onScan(decodedText);
    
    // Reset UI state quickly for next scan
    setTimeout(() => {
      setScanState('scanning');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-4 text-white z-10 shrink-0">
        <button onClick={onClose} className="p-2.5 bg-black/50 backdrop-blur-sm rounded-full border border-white/10">
          <X size={22} />
        </button>
        <div className="text-sm font-medium text-white/70">
          {scanState === 'success' ? '✅ Barkod Okundu' : 'Kamerayı Barkoda Yaklaştırın'}
        </div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden bg-slate-900 flex items-center justify-center">
        <Scanner 
          onScan={handleScan}
          onError={(err) => {
            console.error('QR Scanner error:', err);
            // Ignore minor errors, only show state error if fatal
          }}
          formats={[
            'qr_code',
            'ean_13',
            'ean_8',
            'code_128',
            'upc_a',
            'upc_e'
          ]}
          allowMultiple={true}
          scanDelay={1500}
          styles={{
            container: { width: '100%', height: '100%' },
            video: { objectFit: 'cover' }
          }}
          components={{
            audio: false,
            finder: false, // We will use our own custom finder overlay
          }}
        />

        {/* Custom Overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative w-72 h-44">
            {/* Corner markers */}
            {[
              'top-0 left-0 border-t-4 border-l-4 rounded-tl-xl',
              'top-0 right-0 border-t-4 border-r-4 rounded-tr-xl',
              'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-xl',
              'bottom-0 right-0 border-b-4 border-r-4 rounded-br-xl',
            ].map((cls, i) => (
              <div key={i} className={`absolute w-8 h-8 ${cls} ${scanState === 'success' ? 'border-green-400' : 'border-primary-400'} transition-colors`} />
            ))}

            {/* Scan line animation */}
            {scanState === 'scanning' && (
              <div className="absolute inset-x-0 top-0 h-0.5 bg-primary-400 opacity-80 animate-[scanline_2s_ease-in-out_infinite]"
                style={{ animation: 'scanline 2s ease-in-out infinite' }}
              />
            )}

            {/* Success overlay */}
            {scanState === 'success' && (
              <div className="absolute inset-0 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle2 size={48} className="text-green-400" />
              </div>
            )}
          </div>
        </div>
        <div className="absolute inset-0 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] pointer-events-none rounded-none" />
      </div>

      {/* Bottom Info */}
      <div className="shrink-0 bg-slate-900 text-white p-5 pb-8">
        {scanState === 'success' && lastScanned ? (
          <div className="flex items-center gap-3">
            <CheckCircle2 size={24} className="text-green-400 shrink-0" />
            <div>
              <div className="text-sm font-bold text-green-400">Barkod Başarıyla Okundu</div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">{lastScanned}</div>
            </div>
          </div>
        ) : scanState === 'error' ? (
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} className="text-red-400 shrink-0" />
            <div>
              <div className="text-sm font-bold text-red-400">Kamera Erişimi Başarısız</div>
              <div className="text-xs text-slate-400 mt-0.5">Lütfen kamera izinlerini kontrol edin.</div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-sm text-slate-400">Yeni Nesil Tarayıcı Motoru Aktif</div>
            <div className="flex justify-center gap-3 mt-3">
              {['EAN', 'CODE-128', 'QR', 'UPC'].map(t => (
                <span key={t} className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scanline {
          0%, 100% { top: 0%; }
          50% { top: 100%; }
        }
      `}</style>
    </div>
  );
}
