import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Package, Eye, EyeOff, LogIn } from 'lucide-react';
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
        // Accept if password matches OR if user has no password set yet (migration)
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
    }, 600);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary-600 shadow-2xl shadow-primary-500/40 mb-4">
            <Package size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">NexStock</h1>
          <p className="text-slate-400 mt-1 text-sm">Envanter Yönetim Sistemi</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6">Oturum Aç</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">E-posta</label>
              <input
                required type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
                placeholder="kullanici@nexstock.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Şifre</label>
              <div className="relative">
                <input
                  required
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
                  placeholder="••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                >
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 disabled:opacity-60 mt-2"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><LogIn size={20} /> Giriş Yap</>
              )}
            </button>
          </form>

          {/* Demo Quick Logins */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-xs text-slate-400 text-center mb-3">Hızlı Demo Giriş</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { role: 'admin', label: 'Yönetici', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
                { role: 'manager', label: 'Müdür', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
                { role: 'staff', label: 'Personel', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
              ].map(({ role, label, color }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => demoLogin(role)}
                  className={`py-2 px-3 text-xs font-bold border rounded-lg transition hover:opacity-80 ${color}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 text-center mt-2">Şifre: 1234</p>
          </div>

          {/* Migration helper - clears stale cache */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="text-[10px] text-slate-600 hover:text-slate-400 underline transition"
            >
              Önbelleği temizle (giriş sorunu yaşıyorsanız)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
