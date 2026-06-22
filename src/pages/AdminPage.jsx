import { useState } from 'react';
import AdminLogin from '../components/admin/AdminLogin.jsx';
import AdminForm from '../components/admin/AdminForm.jsx';
import AdminEarningsTable from '../components/admin/AdminEarningsTable.jsx';

export default function AdminPage({ earnings, setEarnings }) {
  const [authed, setAuthed] = useState(() => window.sessionStorage.getItem('otkritie-admin-authed') === 'true');
  const [editingEarning, setEditingEarning] = useState(null);
  const [showForm, setShowForm] = useState(false);

  function handleLoginSuccess() {
    window.sessionStorage.setItem('otkritie-admin-authed', 'true');
    setAuthed(true);
  }

  function handleSave(data) {
    setEarnings((prev) => {
      const exists = prev.some((e) => e.id === data.id);
      return exists ? prev.map((e) => (e.id === data.id ? data : e)) : [...prev, data];
    });
    setShowForm(false);
    setEditingEarning(null);
  }

  function handleEdit(earning) {
    setEditingEarning(earning);
    setShowForm(true);
  }

  function handleDelete(id) {
    setEarnings((prev) => prev.filter((e) => e.id !== id));
  }

  function handleAddNew() {
    setEditingEarning(null);
    setShowForm(true);
  }

  if (!authed) {
    return <AdminLogin onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Админ-панель</h1>
        <a href="?" className="text-xs text-gray-400">
          На главную
        </a>
      </div>

      {showForm ? (
        <AdminForm
          editingEarning={editingEarning}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingEarning(null);
          }}
        />
      ) : (
        <button
          type="button"
          onClick={handleAddNew}
          className="w-full bg-brand text-white font-semibold rounded-md py-2.5 text-sm"
        >
          + Добавить карточку
        </button>
      )}

      <AdminEarningsTable earnings={earnings} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
