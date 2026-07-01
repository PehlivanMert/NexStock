import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary yakaladı:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-100 relative overflow-hidden">
            {/* Arka plan efekti */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                <AlertTriangle size={40} className="text-red-500" />
              </div>
              
              <h1 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">
                Beklenmeyen Bir Hata Oluştu
              </h1>
              
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                İşleminizi gerçekleştirirken bir sorunla karşılaştık. Lütfen sayfayı yenileyin veya ana sayfaya dönün. Sorun devam ederse yöneticinize başvurun.
              </p>
              
              <div className="text-left bg-slate-50 rounded-xl p-4 mb-8 overflow-hidden border border-slate-100">
                <p className="text-xs font-mono text-slate-600 truncate" title={this.state.error?.toString()}>
                  {this.state.error?.toString() || "Bilinmeyen Hata"}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-slate-900/20"
                >
                  <RefreshCcw size={18} />
                  Yenile
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 bg-white border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Home size={18} />
                  Ana Sayfa
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
