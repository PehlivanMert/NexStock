import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Zap, Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getUserProfile } from '../lib/firestoreService';

export default function Login() {
  const login = useStore(state => state.login);
  const loadFromFirestore = useStore(state => state.loadFromFirestore);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const profile = await getUserProfile(cred.user.uid);

      if (!profile) {
        toast.error('Profil bulunamadı.', { description: 'Yöneticinizle iletişime geçin.' });
        await auth.signOut();
        setLoading(false);
        return;
      }

      if (profile.status === 'Pasif') {
        toast.error('Hesabınız pasif.', { description: 'Yöneticinizle iletişime geçin.' });
        await auth.signOut();
        setLoading(false);
        return;
      }

      login({ uid: cred.user.uid, ...profile });
      toast.success(`Hoşgeldiniz, ${profile.name}!`);

      // Load app data in background (non-blocking)
      loadFromFirestore().catch(console.error);

    } catch (err) {
      console.error('Login error:', err);
      let msg = 'Giriş başarısız. Lütfen tekrar deneyin.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'Hatalı e-posta veya şifre.';
      } else if (err.code === 'permission-denied' || err.message?.includes('Missing or insufficient permissions')) {
        msg = 'Veritabanı erişim hatası. Firestore kuralları güncellenmemiş.';
      }
      toast.error(msg, { duration: 5000 });
    }

    setLoading(false);
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
          </div>

        </div>
      </div>
    </div>
  );
}
