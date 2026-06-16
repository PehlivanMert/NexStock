import { useState } from 'react';
import { Users as UsersIcon, Shield, Edit2, Trash2, Plus, X, Save } from 'lucide-react';
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
    setFormData({ name: '', email: '', role: 'staff', location: locations[0]?.name || 'Merkez Depo', status: 'Aktif' });
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

  const handleDelete = (user) => {
    setConfirmDelete(user);
  };

  const forceDelete = () => {
    deleteUser(confirmDelete.id);
    toast.success('Kullanıcı silindi.', { description: confirmDelete.name });
    setConfirmDelete(null);
  };

  const roleLabel = (role) => ({ admin: 'Yönetici', manager: 'Müdür', staff: 'Personel' }[role] || role);
  const roleBadge = (role) => ({ admin: 'bg-purple-100 text-purple-700', manager: 'bg-blue-100 text-blue-700', staff: 'bg-slate-100 text-slate-600' }[role] || '');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kullanıcılar ve Yetkiler</h1>
          <p className="text-slate-500 mt-1">Sisteme erişimi olan personelleri ve rollerini yönetin.</p>
        </div>
        <button onClick={openAdd} className="bg-primary-600 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm hover:bg-primary-700 flex items-center gap-2">
          <Plus size={20} />
          Yeni Kullanıcı
        </button>
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-slate-800">
                {editingUser ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                <input
                  required type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Örn: Hasan Çelik"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
                <input
                  required type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="kullanici@nexstock.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Yetki / Rol</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="admin">Yönetici</option>
                    <option value="manager">Müdür</option>
                    <option value="staff">Personel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Durum</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Pasif">Pasif</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sorumlu Lokasyon</label>
                <select
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="Tüm Lokasyonlar">Tüm Lokasyonlar</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50">İptal</button>
                <button type="submit" className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 flex items-center justify-center gap-2">
                  <Save size={18} /> {editingUser ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center">
            <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} />
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">Kullanıcıyı Sil?</h3>
            <p className="text-sm text-slate-500 mb-6"><strong>{confirmDelete.name}</strong> sistemden kaldırılacak.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50">Vazgeç</button>
              <button onClick={forceDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700">Sil</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Kullanıcı</th>
                <th className="px-6 py-4">Yetki (Rol)</th>
                <th className="px-6 py-4">Sorumlu Lokasyon</th>
                <th className="px-6 py-4">Durum</th>
                <th className="px-6 py-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${roleBadge(user.role)}`}>
                      <Shield size={12} />
                      {roleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">{user.location}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      user.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEdit(user)} className="p-2 text-slate-400 hover:text-primary-600 transition-colors inline-block">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(user)} className="p-2 text-slate-400 hover:text-red-600 transition-colors inline-block ml-1">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">Henüz kullanıcı eklenmedi.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
