import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Zap, Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const login = useStore(state => state.login);
  const users = useStore(state => state.users);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const found = users.find(u =>
        u.email === email &&
        (u.password === password || (!u.password && password === '1234')) &&
        u.status === 'Aktif'
      );
      if (found) {
        login(found);
        toast.success(`Hoşgeldiniz, ${found.name}!`);
      } else {
        toast.error('Hatalı e-posta veya şifre.', { description: 'Lütfen bilgilerinizi kontrol edin.' });
      }
      setLoading(false);
    }, 700);
  };

  const demoLogin = (role) => {
    const demoUsers = {
      admin: { email: 'ali@nexstock.com', password: '1234' },
      manager: { email: 'ayse@nexstock.com', password: '1234' },
      staff: { email: 'mehmet@nexstock.com', password: '1234' },
    };
    setEmail(demoUsers[role].email);
    setPassword(demoUsers[role].password);
  };

  return (
    <div
      className="min-h-screen min-h-dvh flex flex-col items-center justify-center p-5 relative overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 40%, #0f172a 100%)'
      }}
    >
      {/* Ambient glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">

        {/* ── Logo ────────────────────────────────────── */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br from-primary-400 to-primary-700 shadow-2xl shadow-primary-500/40 mb-5 animate-pulse-ring">
            <Zap size={36} className="text-white fill-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">NexStock</h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">Akıllı Envanter Yönetimi</p>
        </div>

        {/* ── Card ────────────────────────────────────── */}
        <div className="animate-fade-in-up delay-100">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl">

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-widest">E-posta</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white/8 border border-white/15 text-white placeholder-slate-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400/60 focus:border-primary-400/60 transition-all text-sm"
                  placeholder="kullanici@nexstock.com"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-widest">Şifre</label>
                <div className="relative">
                  <input
                    required
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 pr-12 bg-white/8 border border-white/15 text-white placeholder-slate-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400/60 focus:border-primary-400/60 transition-all text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-primary-500/30 disabled:opacity-60 active:scale-95 touch-active"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={19} />
                    Giriş Yap
                    <ArrowRight size={16} className="ml-auto opacity-70" />
                  </>
                )}
              </button>
            </form>

            {/* ── Demo Logins ────────────────────────── */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <p className="text-xs text-slate-500 text-center mb-3 font-medium uppercase tracking-wider">Hızlı Demo</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { role: 'admin', label: 'Yönetici', color: 'bg-purple-500/20 text-purple-300 border-purple-500/25 hover:bg-purple-500/30' },
                  { role: 'manager', label: 'Müdür', color: 'bg-blue-500/20 text-blue-300 border-blue-500/25 hover:bg-blue-500/30' },
                  { role: 'staff', label: 'Personel', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/30' },
                ].map(({ role, label, color }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => demoLogin(role)}
                    className={`py-2.5 px-2 text-xs font-bold border rounded-xl transition-all active:scale-95 ${color}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-600 text-center mt-2.5">Şifre: <span className="font-mono font-bold text-slate-500">1234</span></p>
            </div>
          </div>

          {/* Clear cache link */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => { localStorage.clear(); window.location.reload(); }}
              className="text-[11px] text-slate-600 hover:text-slate-400 underline underline-offset-2 transition-colors"
            >
              Önbelleği temizle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
