import { useState } from 'react';
import { Users as UsersIcon, Shield, Edit2, Trash2, Plus, X, Save, Mail, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../../store/useStore';

export default function Users() {
  const users = useStore(state => state.users);
  const deleteUser = useStore(state => state.deleteUser);
  const addUser = useStore(state => state.addUser);
  const updateUser = useStore(state => state.updateUser);
  const locations = useStore(state => state.locations);

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'staff', location: '', status: 'Aktif' });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const openAdd = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'staff', location: locations[0]?.name || '', status: 'Aktif' });
    setShowForm(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role, location: user.location, status: user.status });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(editingUser.id, formData);
      toast.success('Kullanıcı güncellendi!');
    } else {
      addUser(formData);
      toast.success('Yeni kullanıcı eklendi!', { description: formData.name });
    }
    setShowForm(false);
    setEditingUser(null);
  };

  const forceDelete = () => {
    deleteUser(confirmDelete.id);
    toast.success('Kullanıcı silindi.', { description: confirmDelete.name });
    setConfirmDelete(null);
  };

  const roleConfig = {
    admin: { label: 'Yönetici', badge: 'bg-purple-100 text-purple-700 border-purple-200', gradient: 'from-purple-500 to-violet-600' },
    manager: { label: 'Müdür', badge: 'bg-blue-100 text-blue-700 border-blue-200', gradient: 'from-blue-500 to-blue-600' },
    staff: { label: 'Personel', badge: 'bg-slate-100 text-slate-600 border-slate-200', gradient: 'from-slate-400 to-slate-500' },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Kullanıcı Yönetimi</h1>
          <p className="text-slate-500 mt-1 text-sm">Sisteme erişimi olan personelleri ve rollerini yönetin.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary-500/25 hover:from-primary-400 hover:to-primary-500 transition-all"
        >
          <Plus size={18} /> Yeni Kullanıcı
        </button>
      </div>

      {/* ── Add/Edit Modal ────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">
                {editingUser ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {[
                { label: 'Ad Soyad', field: 'name', type: 'text', placeholder: 'Örn: Hasan Çelik', required: true },
                { label: 'E-posta', field: 'email', type: 'email', placeholder: 'kullanici@nexstock.com', required: true },
              ].map(f => (
                <div key={f.field}>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">{f.label}</label>
                  <input
                    required={f.required} type={f.type}
                    value={formData[f.field]}
                    onChange={e => setFormData({ ...formData, [f.field]: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none bg-slate-50 text-sm"
                    placeholder={f.placeholder}
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Yetki</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none bg-slate-50 text-sm"
                  >
                    <option value="admin">Yönetici</option>
                    <option value="manager">Müdür</option>
                    <option value="staff">Personel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Durum</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none bg-slate-50 text-sm"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Pasif">Pasif</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Sorumlu Lokasyon</label>
                <select
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none bg-slate-50 text-sm"
                >
                  <option value="Tüm Lokasyonlar">Tüm Lokasyonlar</option>
                  {locations.map(loc => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 text-sm">İptal</button>
                <button type="submit" className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 flex items-center justify-center gap-2 text-sm">
                  <Save size={16} /> {editingUser ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ────────────────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center animate-scale-in">
            <div className="h-16 w-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-red-600" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">Kullanıcıyı Sil?</h3>
            <p className="text-sm text-slate-500 mb-6"><strong>{confirmDelete.name}</strong> sistemden kaldırılacak.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50">Vazgeç</button>
              <button onClick={forceDelete} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">Sil</button>
            </div>
          </div>
        </div>
      )}

      {/* ── User Cards (Mobile) / Table (Desktop) ──────── */}
      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 card-shadow overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 border-b border-slate-100">
            <tr>
              {['Kullanıcı', 'Yetki / Rol', 'Sorumlu Lokasyon', 'Durum', ''].map(h => (
                <th key={h} className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => {
              const cfg = roleConfig[user.role] || roleConfig.staff;
              return (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-white font-black text-base shrink-0`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{user.name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Mail size={10} /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${cfg.badge}`}>
                      <Shield size={11} /> {cfg.label}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <MapPin size={13} className="text-slate-400" /> {user.location}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                      user.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${user.status === 'Aktif' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                      <button onClick={() => openEdit(user)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => setConfirmDelete(user)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center">
                  <UsersIcon size={32} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-500 font-medium">Henüz kullanıcı eklenmedi</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-400">
          Toplam <strong className="text-slate-600">{users.length}</strong> kullanıcı
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {users.map((user) => {
          const cfg = roleConfig[user.role] || roleConfig.staff;
          return (
            <div key={user.id} className="bg-white rounded-2xl border border-slate-200/80 card-shadow p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-white font-black text-lg shrink-0`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-800">{user.name}</div>
                  <div className="text-xs text-slate-400 truncate">{user.email}</div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border ${cfg.badge}`}>
                  <Shield size={10} /> {cfg.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${user.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {user.status}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(user)} className="p-2 text-slate-400 hover:text-primary-600 rounded-lg transition-colors"><Edit2 size={15} /></button>
                  <button onClick={() => setConfirmDelete(user)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-colors"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
