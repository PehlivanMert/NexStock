import { useState } from 'react';
import { User, LogOut, Settings, Bell, Shield, ChevronRight, Save, X, Eye, EyeOff, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useStore, ROLE_PERMISSIONS } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const user = useStore(state => state.user);
  const logout = useStore(state => state.logout);
  const updateUser = useStore(state => state.updateUser);
  const locations = useStore(state => state.locations);
  const navigate = useNavigate();

  const [activeModal, setActiveModal] = useState(null); // 'account' | 'notifications' | 'permissions'
  const [accountForm, setAccountForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', activeLocationId: user?.activeLocationId || '', password: '', newPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [notifications, setNotifications] = useState(user?.notifications || { lowStock: true, transfer: true, count: false });

  const perms = ROLE_PERMISSIONS[user?.role] || {};
  const roleName = { admin: 'Yönetici', manager: 'Müdür', staff: 'Personel' }[user?.role] || user?.role;
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
      name: accountForm.name,
      email: accountForm.email,
      phone: accountForm.phone,
      activeLocationId: accountForm.activeLocationId,
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

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 px-4 py-8 text-center rounded-b-[2.5rem] shadow-lg shadow-primary-500/20">
        <div className="h-24 w-24 bg-white rounded-full mx-auto flex items-center justify-center shadow-inner mb-4">
          <span className="text-4xl font-bold text-primary-600">{user?.name?.charAt(0)}</span>
        </div>
        <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
        <p className="text-primary-100 font-medium mt-0.5">{roleName}</p>
        {activeLocation && (
          <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full">
            <div className="h-2 w-2 rounded-full bg-green-400"></div>
            <span className="text-white text-xs font-medium">{activeLocation.name}</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 -mt-4 space-y-4">
        {/* Settings Group */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <button onClick={() => setActiveModal('account')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3 text-slate-700">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Settings size={20} /></div>
              <div className="text-left">
                <span className="font-medium block">Hesap Ayarları</span>
                <span className="text-xs text-slate-400">{user?.email}</span>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-400" />
          </button>
          <div className="h-px bg-slate-100 mx-4"></div>

          <button onClick={() => setActiveModal('notifications')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3 text-slate-700">
              <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600"><Bell size={20} /></div>
              <span className="font-medium">Bildirim Tercihleri</span>
            </div>
            <ChevronRight size={18} className="text-slate-400" />
          </button>
          <div className="h-px bg-slate-100 mx-4"></div>

          <button onClick={() => setActiveModal('permissions')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3 text-slate-700">
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600"><Shield size={20} /></div>
              <div className="text-left">
                <span className="font-medium block">Yetkiler ve İzinler</span>
                <span className="text-xs text-slate-400 capitalize">{roleName} yetki seviyesi</span>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Admin panel shortcut */}
        {perms.canAccessAdmin && (
          <button onClick={() => navigate('/admin')} className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors">
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <Settings size={20} />
            </div>
            <span className="font-medium text-slate-700">Yönetim Paneline Git</span>
            <ChevronRight size={18} className="text-slate-400 ml-auto" />
          </button>
        )}

        {/* Logout */}
        <button onClick={handleLogout} className="w-full bg-white rounded-2xl shadow-sm border border-red-100 p-4 flex items-center justify-center gap-2 text-red-600 font-bold hover:bg-red-50 transition-colors">
          <LogOut size={20} />
          Oturumu Kapat
        </button>
      </div>

      {/* Account Settings Modal */}
      {activeModal === 'account' && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-slate-800">Hesap Ayarları</h2>
              <button onClick={() => setActiveModal(null)} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                <input type="text" required value={accountForm.name} onChange={e => setAccountForm({ ...accountForm, name: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
                <input type="email" required value={accountForm.email} onChange={e => setAccountForm({ ...accountForm, email: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                <input type="tel" value={accountForm.phone} onChange={e => setAccountForm({ ...accountForm, phone: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="+90 5xx xxx xx xx" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Aktif Lokasyon</label>
                <select value={accountForm.activeLocationId} onChange={e => setAccountForm({ ...accountForm, activeLocationId: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none">
                  {locations.filter(l => l.status === 'active').map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-500 mb-3">Şifreyi değiştirmek için doldur:</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mevcut Şifre</label>
                    <div className="relative">
                      <input type={showPass ? 'text' : 'password'} value={accountForm.password}
                        onChange={e => setAccountForm({ ...accountForm, password: e.target.value })}
                        className="w-full p-3 pr-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
                      <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Yeni Şifre</label>
                    <input type="password" value={accountForm.newPassword}
                      onChange={e => setAccountForm({ ...accountForm, newPassword: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setActiveModal(null)} className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium">İptal</button>
                <button type="submit" className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium flex items-center justify-center gap-2">
                  <Save size={16} /> Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {activeModal === 'notifications' && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-slate-800">Bildirim Tercihleri</h2>
              <button onClick={() => setActiveModal(null)} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              {[
                { key: 'lowStock', label: 'Kritik Stok Uyarıları', desc: 'Stok eşiğin altına düştüğünde bildir' },
                { key: 'transfer', label: 'Transfer Bildirimleri', desc: 'Transfer işlemlerinde bildir' },
                { key: 'count', label: 'Sayım Hatırlatmaları', desc: 'Sayım zamanı geldiğinde bildir' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <div className="font-medium text-slate-800 text-sm">{label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                  </div>
                  <button
                    onClick={() => setNotifications(n => ({ ...n, [key]: !n[key] }))}
                    className={`h-7 w-12 rounded-full transition-colors flex items-center px-1 ${notifications[key] ? 'bg-primary-500 justify-end' : 'bg-slate-300 justify-start'}`}
                  >
                    <div className="h-5 w-5 bg-white rounded-full shadow" />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={handleSaveNotifications} className="w-full mt-5 py-3 bg-primary-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
              <Check size={18} /> Kaydet
            </button>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {activeModal === 'permissions' && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-slate-800">Yetkiler ve İzinler</h2>
              <button onClick={() => setActiveModal(null)} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"><X size={18} /></button>
            </div>
            <div className="mb-4 p-3 bg-primary-50 rounded-xl">
              <div className="text-sm font-bold text-primary-700">Mevcut Rol: {roleName}</div>
              <div className="text-xs text-primary-600 mt-0.5">Rol değişikliği için yönetici ile iletişime geçin.</div>
            </div>
            <div className="space-y-2">
              {Object.entries(perms).map(([key, val]) => {
                const labels = {
                  canAccessAdmin: 'Yönetim Paneli Erişimi',
                  canManageUsers: 'Kullanıcı Yönetimi',
                  canManageLocations: 'Lokasyon Yönetimi',
                  canViewReports: 'Raporları Görüntüleme',
                  canDeleteInventory: 'Stok Silme / Düzenleme',
                  canImport: 'Toplu Ürün Aktarımı',
                  canTransfer: 'Stok Transferi',
                  canCount: 'Stok Sayımı',
                };
                return (
                  <div key={key} className="flex items-center justify-between py-2.5 px-3 rounded-lg">
                    <span className="text-sm text-slate-700">{labels[key] || key}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${val ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {val ? 'İzinli' : 'Kısıtlı'}
                    </span>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setActiveModal(null)} className="w-full mt-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium">Kapat</button>
          </div>
        </div>
      )}
    </div>
  );
}
