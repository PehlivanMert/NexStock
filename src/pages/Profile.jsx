import { useState } from 'react';
import { User, LogOut, Settings, Bell, Shield, ChevronRight, Save, X, Eye, EyeOff, Check, MapPin, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useStore, ROLE_PERMISSIONS } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { updateUserProfile } from '../lib/firestoreService';

export default function Profile() {
  const user = useStore(state => state.user);
  const logout = useStore(state => state.logout);
  const updateProfile = useStore(state => state.updateProfile);
  const locations = useStore(state => state.locations);
  const navigate = useNavigate();

  const [activeModal, setActiveModal] = useState(null);
  const [accountForm, setAccountForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    activeLocationId: user?.activeLocationId || '',
  });
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [showPass, setShowPass] = useState({ current: false, new: false });
  const [notifications, setNotifications] = useState(
    user?.notifications || { lowStock: true, transfer: true, count: false }
  );
  const [saving, setSaving] = useState(false);

  const perms = ROLE_PERMISSIONS[user?.role] || {};
  const isAdmin = user?.role === 'admin';
  const roleName = { admin: 'Yönetici', manager: 'Müdür', staff: 'Personel' }[user?.role] || user?.role;
  const roleColor = { admin: 'from-purple-500 to-violet-600', manager: 'from-blue-500 to-blue-600', staff: 'from-emerald-500 to-emerald-600' }[user?.role] || 'from-slate-500 to-slate-600';
  const activeLocation = user?.activeLocationId === 'all'
    ? { name: 'Tüm Lokasyonlar', type: 'all' }
    : locations.find(l => l.id === user?.activeLocationId);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (_) {}
    logout();
    navigate('/login');
    toast.success('Oturum kapatıldı.');
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updates = {
        name: accountForm.name,
        phone: accountForm.phone,
        activeLocationId: accountForm.activeLocationId,
      };
      await updateUserProfile(user.uid, updates);
      updateProfile(updates);
      toast.success('Hesap bilgileri güncellendi!');
      setActiveModal(null);
    } catch (err) {
      toast.error('Güncelleme başarısız: ' + err.message);
    }
    setSaving(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirm) {
      toast.error('Yeni şifreler eşleşmiyor.');
      return;
    }
    if (passwordForm.newPass.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    setSaving(true);
    try {
      const currentAuthUser = auth.currentUser;
      if (!currentAuthUser) throw new Error('Oturum bulunamadı');

      // Re-authenticate first
      const credential = EmailAuthProvider.credential(user.email, passwordForm.current);
      await reauthenticateWithCredential(currentAuthUser, credential);
      await updatePassword(currentAuthUser, passwordForm.newPass);

      toast.success('Şifre başarıyla değiştirildi!');
      setPasswordForm({ current: '', newPass: '', confirm: '' });
      setActiveModal(null);
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        toast.error('Mevcut şifre yanlış.');
      } else {
        toast.error('Şifre değiştirilemedi: ' + err.message);
      }
    }
    setSaving(false);
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      // Request browser notification permission if enabling any notification
      const hasEnabled = Object.values(notifications).some(v => v);
      if (hasEnabled && 'Notification' in window && Notification.permission === 'default') {
        const result = await Notification.requestPermission();
        if (result === 'denied') {
          toast.warning('Tarayıcı bildirimleri engellendi. Ayarlardan izin verin.');
        }
      }

      await updateUserProfile(user.uid, { notifications });
      updateProfile({ notifications });
      toast.success('Bildirim tercihleri kaydedildi!');
      setActiveModal(null);
    } catch (err) {
      toast.error('Kayıt başarısız: ' + err.message);
    }
    setSaving(false);
  };

  // Trigger a test notification to verify it works
  const sendTestNotification = () => {
    if (!('Notification' in window)) {
      toast.error('Tarayıcınız bildirim desteklemiyor.');
      return;
    }
    if (Notification.permission !== 'granted') {
      toast.warning('Bildirim izni verilmemiş. Önce kaydedin ve izin verin.');
      return;
    }
    new Notification('NexStock Test Bildirimi', {
      body: 'Bildirimler çalışıyor!',
      icon: '/icon-192.png',
    });
    toast.success('Test bildirimi gönderildi!');
  };

  const settingsGroups = [
    {
      items: [
        { id: 'account', icon: Settings, iconBg: 'bg-blue-50', iconColor: 'text-blue-600', label: 'Hesap Ayarları', sub: user?.email },
        // Password change only for admin users
        ...(isAdmin ? [{ id: 'password', icon: Lock, iconBg: 'bg-orange-50', iconColor: 'text-orange-600', label: 'Şifre Değiştir', sub: 'Firebase Auth şifrenizi değiştirin' }] : []),
        { id: 'notifications', icon: Bell, iconBg: 'bg-purple-50', iconColor: 'text-purple-600', label: 'Bildirim Tercihleri', sub: 'Stok ve transfer bildirimleri' },
        { id: 'permissions', icon: Shield, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', label: 'Yetkiler', sub: `${roleName} yetki seviyesi` },
      ]
    }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50">

      {/* ── Profile Hero ────────────────────────────────── */}
      <div className={`bg-gradient-to-br ${roleColor} px-4 pt-8 pb-12 text-center relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-10 -mb-10" />

        <div className="relative">
          <div className="h-24 w-24 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-xl mb-4 border-4 border-white/30">
            <span className="text-4xl font-black text-slate-700">{user?.name?.charAt(0).toUpperCase()}</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">{user?.name}</h1>
          <div className="inline-flex items-center gap-2 mt-2 bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20">
            <div className="h-1.5 w-1.5 rounded-full bg-white" />
            <p className="text-white/90 text-sm font-semibold">{roleName}</p>
          </div>

          {activeLocation && (
            <div className="flex items-center justify-center gap-1.5 mt-3">
              <MapPin size={12} className="text-white/60" />
              <span className="text-white/70 text-xs font-medium">{activeLocation.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 -mt-6 space-y-3 pb-28">

        {/* Settings Card */}
        <div className="bg-white rounded-2xl card-shadow border border-slate-100/80 overflow-hidden animate-fade-in-up">
          {settingsGroups[0].items.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={item.id}>
                {i > 0 && <div className="h-px bg-slate-100 mx-4" />}
                <button
                  onClick={() => setActiveModal(item.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl ${item.iconBg} flex items-center justify-center ${item.iconColor}`}>
                      <Icon size={19} />
                    </div>
                    <div className="text-left">
                      <span className="font-semibold text-slate-800 block text-sm">{item.label}</span>
                      {item.sub && <span className="text-xs text-slate-400 mt-0.5 block">{item.sub}</span>}
                    </div>
                  </div>
                  <ChevronRight size={17} className="text-slate-300" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Admin Panel shortcut */}
        {perms.canAccessAdmin && (
          <button
            onClick={() => navigate('/admin')}
            className="w-full bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-4 flex items-center gap-3 active:scale-98 transition-all animate-fade-in-up delay-75"
          >
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Settings size={19} />
            </div>
            <span className="font-bold text-white flex-1 text-left text-sm">Yönetim Paneline Git</span>
            <ChevronRight size={17} className="text-white/40" />
          </button>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-white rounded-2xl card-shadow border border-red-100 p-4 flex items-center justify-center gap-2.5 text-red-600 font-bold hover:bg-red-50 active:scale-98 transition-all animate-fade-in-up delay-100"
        >
          <LogOut size={18} />
          Oturumu Kapat
        </button>

        <p className="text-center text-xs text-slate-300 font-medium pb-2">NexStock v2.2.0</p>
      </div>

      {/* ── Account Modal ────────────────────────────────── */}
      {activeModal === 'account' && (
        <BottomSheet title="Hesap Ayarları" onClose={() => setActiveModal(null)}>
          <form onSubmit={handleSaveAccount} className="space-y-4">
            <FormField label="Ad Soyad">
              <input
                type="text" required value={accountForm.name}
                onChange={e => setAccountForm({ ...accountForm, name: e.target.value })}
                className="w-full p-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none bg-slate-50 text-sm"
              />
            </FormField>
            <FormField label="E-posta (değiştirilemez)">
              <input
                type="email" value={user?.email} disabled
                className="w-full p-3.5 border border-slate-200 rounded-2xl bg-slate-100 text-slate-400 text-sm cursor-not-allowed"
              />
            </FormField>
            <FormField label="Telefon">
              <input
                type="tel" value={accountForm.phone}
                onChange={e => setAccountForm({ ...accountForm, phone: e.target.value })}
                placeholder="+90 5xx xxx xx xx"
                className="w-full p-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none bg-slate-50 text-sm"
              />
            </FormField>
            <FormField label="Aktif Lokasyon">
              <select
                value={accountForm.activeLocationId}
                onChange={e => setAccountForm({ ...accountForm, activeLocationId: e.target.value })}
                className="w-full p-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 outline-none bg-slate-50 text-sm"
              >
                <option value="">Seçiniz</option>
                <option value="all">Tüm Lokasyonlar</option>
                {locations.filter(l => l.status === 'active').map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </FormField>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setActiveModal(null)} className="flex-1 py-3.5 border border-slate-200 text-slate-600 rounded-2xl font-semibold text-sm">İptal</button>
              <button type="submit" disabled={saving} className="flex-1 py-3.5 bg-primary-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 text-sm disabled:opacity-60">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Kaydet
              </button>
            </div>
          </form>
        </BottomSheet>
      )}

      {/* ── Password Modal (Admin only) ───────────────────── */}
      {activeModal === 'password' && isAdmin && (
        <BottomSheet title="Şifre Değiştir" onClose={() => setActiveModal(null)}>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <FormField label="Mevcut Şifre">
              <div className="relative">
                <input
                  type={showPass.current ? 'text' : 'password'}
                  required value={passwordForm.current}
                  onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  placeholder="Mevcut şifreniz"
                  className="w-full p-3.5 pr-12 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 outline-none bg-slate-50 text-sm"
                />
                <button type="button" onClick={() => setShowPass(s => ({ ...s, current: !s.current }))} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 p-1">
                  {showPass.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </FormField>
            <FormField label="Yeni Şifre">
              <div className="relative">
                <input
                  type={showPass.new ? 'text' : 'password'}
                  required value={passwordForm.newPass}
                  onChange={e => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                  placeholder="En az 6 karakter"
                  minLength={6}
                  className="w-full p-3.5 pr-12 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 outline-none bg-slate-50 text-sm"
                />
                <button type="button" onClick={() => setShowPass(s => ({ ...s, new: !s.new }))} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 p-1">
                  {showPass.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </FormField>
            <FormField label="Yeni Şifre (tekrar)">
              <input
                type="password" required value={passwordForm.confirm}
                onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                placeholder="Şifreyi doğrulayın"
                className="w-full p-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 outline-none bg-slate-50 text-sm"
              />
            </FormField>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setActiveModal(null)} className="flex-1 py-3.5 border border-slate-200 text-slate-600 rounded-2xl font-semibold text-sm">İptal</button>
              <button type="submit" disabled={saving} className="flex-1 py-3.5 bg-orange-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 text-sm disabled:opacity-60">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />} Değiştir
              </button>
            </div>
          </form>
        </BottomSheet>
      )}

      {/* ── Notifications Modal ────────────────────────── */}
      {activeModal === 'notifications' && (
        <BottomSheet title="Bildirim Tercihleri" onClose={() => setActiveModal(null)}>
          {/* Browser permission status */}
          {'Notification' in window && (
            <div className={`mb-4 p-3 rounded-2xl text-xs font-medium flex items-center gap-2 ${
              Notification.permission === 'granted'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : Notification.permission === 'denied'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              <Bell size={14} />
              Tarayıcı bildirimleri:{' '}
              <strong>
                {Notification.permission === 'granted' ? 'İzin Verildi' :
                 Notification.permission === 'denied' ? 'Engellendi' : 'Beklemede'}
              </strong>
              {Notification.permission !== 'denied' && (
                <button onClick={sendTestNotification} className="ml-auto underline">Test Et</button>
              )}
            </div>
          )}

          <div className="space-y-3">
            {[
              { key: 'lowStock', label: 'Kritik Stok Uyarıları', desc: 'Stok eşiğin altına düştüğünde' },
              { key: 'transfer', label: 'Transfer Bildirimleri', desc: 'Transfer işlemlerinde bildir' },
              { key: 'count', label: 'Sayım Hatırlatmaları', desc: 'Sayım zamanı geldiğinde' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
                </div>
                <button
                  onClick={() => setNotifications(n => ({ ...n, [key]: !n[key] }))}
                  className={`relative h-7 w-12 rounded-full transition-all duration-300 ${notifications[key] ? 'bg-primary-500 shadow-md shadow-primary-400/30' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 h-5 w-5 bg-white rounded-full shadow transition-all duration-300 ${notifications[key] ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleSaveNotifications}
            disabled={saving}
            className="w-full mt-4 py-3.5 bg-primary-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 disabled:opacity-60"
          >
            {saving ? <Loader2 size={17} className="animate-spin" /> : <Check size={17} />} Kaydet
          </button>
        </BottomSheet>
      )}

      {/* ── Permissions Modal ──────────────────────────── */}
      {activeModal === 'permissions' && (
        <BottomSheet title="Yetkiler ve İzinler" onClose={() => setActiveModal(null)}>
          <div className={`mb-4 p-3.5 rounded-2xl bg-gradient-to-r ${roleColor} text-white`}>
            <div className="text-sm font-bold">Mevcut Rol: {roleName}</div>
            <div className="text-xs opacity-70 mt-0.5">Rol değişikliği için yönetici ile iletişime geçin.</div>
          </div>
          <div className="space-y-1.5">
            {Object.entries(perms).map(([key, val]) => {
              const labels = {
                canAccessAdmin: 'Yönetim Paneli Erişimi', canManageUsers: 'Kullanıcı Yönetimi',
                canManageLocations: 'Lokasyon Yönetimi', canViewReports: 'Raporları Görüntüleme',
                canDeleteInventory: 'Stok Düzenleme / Silme', canImport: 'Toplu Ürün Aktarımı',
                canTransfer: 'Stok Transferi', canCount: 'Stok Sayımı',
              };
              return (
                <div key={key} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-slate-50">
                  <span className="text-sm text-slate-700 font-medium">{labels[key] || key}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${val ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                    {val ? '✓ İzinli' : '✗ Kısıtlı'}
                  </span>
                </div>
              );
            })}
          </div>
          <button onClick={() => setActiveModal(null)} className="w-full mt-4 py-3.5 bg-slate-100 text-slate-700 rounded-2xl font-semibold">
            Kapat
          </button>
        </BottomSheet>
      )}
    </div>
  );
}

function BottomSheet({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-in-bottom">
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 bg-slate-200 rounded-full" />
        </div>
        <div className="px-5 pb-8 pt-2">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-bold text-slate-800">{title}</h2>
            <button onClick={onClose} className="p-2 bg-slate-100 text-slate-500 rounded-xl active:scale-90 transition-transform">
              <X size={17} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}
