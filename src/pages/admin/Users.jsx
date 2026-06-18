import { useState, useEffect, useCallback } from 'react';
import {
  Users as UsersIcon, Shield, Edit2, Trash2, Plus, X,
  Save, Mail, MapPin, Lock, Eye, EyeOff, Loader2, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../../store/useStore';
import {
  loadAllUsers, setUserProfile, updateUserProfile,
  deleteUserDoc, logActivity
} from '../../lib/firestoreService';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../../lib/firebase';

// ─── Rol renk/etiket config ──────────────────────────────────────────────────
const roleConfig = {
  admin:   { label: 'Yönetici', badge: 'bg-purple-100 text-purple-700 border-purple-200', gradient: 'from-purple-500 to-violet-600' },
  manager: { label: 'Müdür',    badge: 'bg-blue-100 text-blue-700 border-blue-200',       gradient: 'from-blue-500 to-blue-600'   },
  staff:   { label: 'Personel', badge: 'bg-slate-100 text-slate-600 border-slate-200',    gradient: 'from-slate-400 to-slate-500' },
};

const emptyForm = {
  name: '', email: '', password: '',
  role: 'staff', location: '', status: 'Aktif', phone: '',
};

export default function Users() {
  const currentUser = useStore(state => state.user);
  const locations   = useStore(state => state.locations);

  // ── Local state ──────────────────────────────────────────────
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData]       = useState(emptyForm);
  const [showPass, setShowPass]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving]           = useState(false);

  // ── Firestore'dan kullanıcıları yükle ────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const list = await loadAllUsers();
      setUsers(list);
    } catch (err) {
      toast.error('Kullanıcılar yüklenemedi: ' + err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Form aç/kapat ────────────────────────────────────────────
  const openAdd = () => {
    setEditingUser(null);
    setFormData({ ...emptyForm, location: locations[0]?.name || '' });
    setShowPass(false);
    setShowForm(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '', email: user.email || '',
      password: '', role: user.role || 'staff',
      location: user.location || '', status: user.status || 'Aktif',
      phone: user.phone || '',
    });
    setShowPass(false);
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditingUser(null); };

  // ── Kaydet (ekle / düzenle) ───────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingUser) {
      if (!formData.password) { toast.error('Şifre zorunludur.'); return; }
      if (formData.password.length < 6) { toast.error('Şifre en az 6 karakter olmalıdır.'); return; }
    }

    setSaving(true);
    try {
      if (editingUser) {
        // ── Düzenle ──
        const updates = {
          name: formData.name, role: formData.role,
          location: formData.location, status: formData.status, phone: formData.phone,
        };
        await updateUserProfile(editingUser.uid, updates);

        // Local listeyi güncelle
        setUsers(prev => prev.map(u => u.uid === editingUser.uid ? { ...u, ...updates } : u));

        await logActivity({
          action: 'EDIT_USER', userId: currentUser?.uid,
          userName: currentUser?.name, userRole: currentUser?.role,
          details: { targetUser: formData.name, targetUid: editingUser.uid, role: formData.role },
        });
        toast.success('Kullanıcı güncellendi!');
        closeForm();

      } else {
        // ── Yeni kullanıcı ekle ──
        // 1) Firebase Auth'ta kullanıcı oluştur (bu adım mevcut oturumu kapatır!)
        const adminEmail    = currentUser?.email;
        const adminPassword = prompt('Güvenlik için admin şifrenizi girin:');
        if (!adminPassword) { setSaving(false); return; }

        const profileData = {
          name: formData.name, email: formData.email, role: formData.role,
          location: formData.location, status: formData.status, phone: formData.phone,
          notifications: { lowStock: true, transfer: true, count: false },
          createdAt: new Date().toISOString(),
        };

        // Yeni kullanıcıyı oluştur
        const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const newUid = cred.user.uid;

        // Firestore profilini kaydet
        await setUserProfile(newUid, profileData);

        // Activity log (henüz oturum değiştiği için try/catch)
        try {
          await logActivity({
            action: 'ADD_USER', userId: currentUser?.uid,
            userName: currentUser?.name, userRole: currentUser?.role,
            details: { newUser: formData.name, newEmail: formData.email, role: formData.role },
          });
        } catch (_) {}

        // 2) Admin'i geri al
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

        // 3) Local listeye ekle
        setUsers(prev => [...prev, { uid: newUid, ...profileData }]);

        toast.success('Kullanıcı oluşturuldu!', { description: `${formData.name} sisteme eklendi.` });
        closeForm();
      }

    } catch (err) {
      console.error('User save error:', err);
      if (err.code === 'auth/email-already-in-use') {
        toast.error('Bu e-posta adresi zaten kayıtlı.');
      } else if (err.code === 'auth/weak-password') {
        toast.error('Şifre çok zayıf (min 6 karakter).');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        toast.error('Admin şifresi yanlış. Kullanıcı oluşturuldu ancak oturum yenilenemedi.');
        // Yine de listeye ekle
        fetchUsers();
      } else {
        toast.error('İşlem başarısız: ' + (err.message || 'Bilinmeyen hata'));
      }
    }
    setSaving(false);
  };

  // ── Sil ──────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirmDelete) return;
    setSaving(true);
    try {
      await deleteUserDoc(confirmDelete.uid);
      setUsers(prev => prev.filter(u => u.uid !== confirmDelete.uid));

      await logActivity({
        action: 'DELETE_USER', userId: currentUser?.uid,
        userName: currentUser?.name, userRole: currentUser?.role,
        details: { deletedUser: confirmDelete.name, deletedUid: confirmDelete.uid },
      });

      toast.success('Kullanıcı silindi.', { description: confirmDelete.name });
      setConfirmDelete(null);
    } catch (err) {
      toast.error('Silme başarısız: ' + err.message);
    }
    setSaving(false);
  };

  // ════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Kullanıcı Yönetimi</h1>
          <p className="text-slate-500 mt-1 text-sm">Sisteme erişimi olan personelleri ve rollerini yönetin.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors text-sm"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Yenile
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary-500/25 hover:from-primary-400 hover:to-primary-500 transition-all"
          >
            <Plus size={18} /> Yeni Kullanıcı
          </button>
        </div>
      </div>

      {/* ── Yükleniyor ────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-primary-500" />
          <span className="ml-3 text-slate-500 font-medium">Kullanıcılar yükleniyor…</span>
        </div>
      )}

      {/* ── Ekle / Düzenle Modalı ──────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-slate-800">
                {editingUser ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı Ekle'}
              </h2>
              <button onClick={closeForm} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              {/* Ad Soyad */}
              <Field label="Ad Soyad *">
                <input
                  required type="text" value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none bg-slate-50 text-sm"
                  placeholder="Örn: Hasan Çelik"
                />
              </Field>

              {/* E-posta - sadece yeni kullanıcıda */}
              {!editingUser && (
                <Field label="E-posta *">
                  <input
                    required type="email" value={formData.email}
                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none bg-slate-50 text-sm"
                    placeholder="kullanici@nexstock.com"
                  />
                </Field>
              )}

              {/* Şifre - sadece yeni kullanıcıda */}
              {!editingUser && (
                <Field label="Şifre *">
                  <div className="relative">
                    <input
                      required type={showPass ? 'text' : 'password'} value={formData.password}
                      onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                      className="w-full p-3 pr-11 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none bg-slate-50 text-sm"
                      placeholder="En az 6 karakter" minLength={6}
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <Lock size={10} /> Yeni kullanıcı bu şifreyle giriş yapacak.
                  </p>
                </Field>
              )}

              {/* Yetki & Durum */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Yetki">
                  <select value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none bg-slate-50 text-sm">
                    <option value="admin">Yönetici</option>
                    <option value="manager">Müdür</option>
                    <option value="staff">Personel</option>
                  </select>
                </Field>
                <Field label="Durum">
                  <select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none bg-slate-50 text-sm">
                    <option value="Aktif">Aktif</option>
                    <option value="Pasif">Pasif</option>
                  </select>
                </Field>
              </div>

              {/* Lokasyon */}
              <Field label="Sorumlu Lokasyon">
                <select value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none bg-slate-50 text-sm">
                  <option value="Tüm Lokasyonlar">Tüm Lokasyonlar</option>
                  {locations.map(loc => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
                </select>
              </Field>

              {/* Telefon */}
              <Field label="Telefon">
                <input type="tel" value={formData.phone}
                  onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none bg-slate-50 text-sm"
                  placeholder="+90 5xx xxx xx xx"
                />
              </Field>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 text-sm">
                  İptal
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 flex items-center justify-center gap-2 text-sm disabled:opacity-60">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {editingUser ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Silme Onayı ──────────────────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center">
            <div className="h-16 w-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-red-600" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">Kullanıcıyı Sil?</h3>
            <p className="text-sm text-slate-500 mb-1">
              <strong>{confirmDelete.name}</strong> Firestore'dan kaldırılacak.
            </p>
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-5">
              Firebase Auth kaydı konsol'dan ayrıca silinmelidir.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50">
                Vazgeç
              </button>
              <button onClick={handleDelete} disabled={saving}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-60 flex items-center justify-center">
                {saving ? <Loader2 size={16} className="animate-spin" /> : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Kullanıcı Tablosu (her ekran boyutunda çalışır) ── */}
      {!loading && (
        <div className="bg-white rounded-2xl border border-slate-200/80 card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr>
                  {['Kullanıcı', 'Yetki / Rol', 'Lokasyon', 'Durum', ''].map(h => (
                    <th key={h} className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(user => {
                  const cfg = roleConfig[user.role] || roleConfig.staff;
                  return (
                    <tr key={user.uid} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Kullanıcı */}
                      <td className="px-5 py-4 min-w-[200px]">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-white font-black text-base shrink-0`}>
                            {(user.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-800 truncate">{user.name}</div>
                            <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                              <Mail size={10} className="shrink-0" /> {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* Rol */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${cfg.badge}`}>
                          <Shield size={11} /> {cfg.label}
                        </span>
                      </td>
                      {/* Lokasyon */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <MapPin size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{user.location || '—'}</span>
                        </div>
                      </td>
                      {/* Durum */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          user.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                            user.status === 'Aktif' ? 'bg-emerald-500' : 'bg-slate-400'
                          }`} />
                          {user.status || '—'}
                        </span>
                      </td>
                      {/* Aksiyonlar */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => openEdit(user)}
                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <Edit2 size={15} />
                          </button>
                          {user.uid !== currentUser?.uid && (
                            <button
                              onClick={() => setConfirmDelete(user)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Sil"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center">
                      <UsersIcon size={32} className="mx-auto mb-3 text-slate-300" />
                      <p className="text-slate-500 font-medium">Henüz kullanıcı yok</p>
                      <p className="text-slate-400 text-xs mt-1">Firestore'da /users koleksiyonu boş veya kurallar güncel değil.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-400">
            Toplam <strong className="text-slate-600">{users.length}</strong> kullanıcı
          </div>
        </div>
      )}
    </div>
  );
}

// ── Yardımcı bileşenler ──────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}
