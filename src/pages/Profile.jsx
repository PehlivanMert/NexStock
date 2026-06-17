import { useState } from 'react';
import { User, LogOut, Settings, Bell, Shield, ChevronRight, Save, X, Eye, EyeOff, Check, MapPin, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useStore, ROLE_PERMISSIONS } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const user = useStore(state => state.user);
  const logout = useStore(state => state.logout);
  const updateUser = useStore(state => state.updateUser);
  const locations = useStore(state => state.locations);
  const navigate = useNavigate();

  const [activeModal, setActiveModal] = useState(null);
  const [accountForm, setAccountForm] = useState({
    name: user?.name || '', email: user?.email || '', phone: user?.phone || '',
    activeLocationId: user?.activeLocationId || '', password: '', newPassword: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [notifications, setNotifications] = useState(user?.notifications || { lowStock: true, transfer: true, count: false });

  const perms = ROLE_PERMISSIONS[user?.role] || {};
  const roleName = { admin: 'Yönetici', manager: 'Müdür', staff: 'Personel' }[user?.role] || user?.role;
  const roleColor = { admin: 'from-purple-500 to-violet-600', manager: 'from-blue-500 to-blue-600', staff: 'from-emerald-500 to-emerald-600' }[user?.role] || 'from-slate-500 to-slate-600';
  const activeLocation = locations.find(l => l.id === user?.activeLocationId);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Oturum kapatıldı.');
  };

  const handleSaveAccount = (e) => {
    e.preventDefault();
    if (accountForm.newPassword && accountForm.password !== user.password) {
      toast.error('Mevcut şifre yanlış.');
      return;
    }
    const updates = {
      name: accountForm.name, email: accountForm.email,
      phone: accountForm.phone, activeLocationId: accountForm.activeLocationId,
    };
    if (accountForm.newPassword) updates.password = accountForm.newPassword;
    updateUser(user.id, updates);
    toast.success('Hesap bilgileri güncellendi!');
    setActiveModal(null);
  };

  const handleSaveNotifications = () => {
    updateUser(user.id, { notifications });
    toast.success('Bildirim tercihleri kaydedildi!');
    setActiveModal(null);
  };

  const settingsGroups = [
    {
      items: [
        { id: 'account', icon: Settings, iconBg: 'bg-blue-50', iconColor: 'text-blue-600', label: 'Hesap Ayarları', sub: user?.email },
        { id: 'notifications', icon: Bell, iconBg: 'bg-purple-50', iconColor: 'text-purple-600', label: 'Bildirim Tercihleri', sub: 'Stok ve transfer bildirimleri' },
        { id: 'permissions', icon: Shield, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', label: 'Yetkiler', sub: `${roleName} yetki seviyesi` },
      ]
    }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50">

      {/* ── Profile Hero ────────────────────────────────── */}
      <div className={`bg-gradient-to-br ${roleColor} px-4 pt-8 pb-12 text-center relative overflow-hidden`}>
        {/* Ambient blobs */}
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

        {/* Version */}
        <p className="text-center text-xs text-slate-300 font-medium pb-2">NexStock v2.1.0</p>
      </div>

      {/* ── Account Modal ────────────────────────────────── */}
      {activeModal === 'account' && (
        <BottomSheet title="Hesap Ayarları" onClose={() => setActiveModal(null)}>
          <form onSubmit={handleSaveAccount} className="space-y-4">
            {[
              { label: 'Ad Soyad', type: 'text', field: 'name', required: true },
              { label: 'E-posta', type: 'email', field: 'email', required: true },
              { label: 'Telefon', type: 'tel', field: 'phone', placeholder: '+90 5xx xxx xx xx' },
            ].map(f => (
              <FormField key={f.field} label={f.label}>
                <input
                  type={f.type} required={f.required} value={accountForm[f.field]}
                  onChange={e => setAccountForm({ ...accountForm, [f.field]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full p-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none bg-slate-50 text-sm"
                />
              </FormField>
            ))}
            <FormField label="Aktif Lokasyon">
              <select
                value={accountForm.activeLocationId}
                onChange={e => setAccountForm({ ...accountForm, activeLocationId: e.target.value })}
                className="w-full p-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none bg-slate-50 text-sm"
              >
                {locations.filter(l => l.status === 'active').map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </FormField>

            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Lock size={14} className="text-slate-400" />
                <p className="text-xs text-slate-500 font-medium">Şifreyi değiştir (opsiyonel)</p>
              </div>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} value={accountForm.password}
                    onChange={e => setAccountForm({ ...accountForm, password: e.target.value })}
                    placeholder="Mevcut şifre"
                    className="w-full p-3.5 pr-12 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 outline-none bg-slate-50 text-sm"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 p-1">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <input
                  type="password" value={accountForm.newPassword}
                  onChange={e => setAccountForm({ ...accountForm, newPassword: e.target.value })}
                  placeholder="Yeni şifre"
                  className="w-full p-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 outline-none bg-slate-50 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setActiveModal(null)} className="flex-1 py-3.5 border border-slate-200 text-slate-600 rounded-2xl font-semibold text-sm">İptal</button>
              <button type="submit" className="flex-1 py-3.5 bg-primary-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 text-sm">
                <Save size={15} /> Kaydet
              </button>
            </div>
          </form>
        </BottomSheet>
      )}

      {/* ── Notifications Modal ────────────────────────── */}
      {activeModal === 'notifications' && (
        <BottomSheet title="Bildirim Tercihleri" onClose={() => setActiveModal(null)}>
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
          <button onClick={handleSaveNotifications} className="w-full mt-4 py-3.5 bg-primary-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20">
            <Check size={17} /> Kaydet
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

// Reusable bottom sheet component
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
