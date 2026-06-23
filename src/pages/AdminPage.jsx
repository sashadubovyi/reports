import { useEffect, useState } from 'react';
import AdminLogin from '../components/admin/AdminLogin.jsx';
import AdminForm from '../components/admin/AdminForm.jsx';
import AdminEarningsTable from '../components/admin/AdminEarningsTable.jsx';
import DiscrepancyBanner from '../components/admin/DiscrepancyBanner.jsx';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { fetchEarningsDiscrepancies, shouldRunCheck } from '../utils/finnhubCheck.js';

export default function AdminPage({ earnings, setEarnings }) {
  const [authed, setAuthed] = useState(() => window.sessionStorage.getItem('otkritie-admin-authed') === 'true');
  const [editingEarning, setEditingEarning] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [lastCheck, setLastCheck] = useLocalStorage('otkritie-finnhub-last-check', null);
  const [discrepancies, setDiscrepancies] = useLocalStorage('otkritie-finnhub-discrepancies', []);
  const [checkStatus, setCheckStatus] = useState(null);

  useEffect(() => {
    if (!authed || !shouldRunCheck(lastCheck)) return;
    setCheckStatus('checking');
    fetchEarningsDiscrepancies(earnings)
      .then((found) => {
        setDiscrepancies(found);
        setLastCheck(new Date().toISOString());
        setCheckStatus('ok');
      })
      .catch((err) => {
        console.error('Finnhub check failed:', err);
        setCheckStatus('error');
      });
    // Runs once per admin session/day; intentionally not re-triggered by earnings edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  function handleApplyDiscrepancy(target) {
    setEarnings((prev) =>
      prev.map((e) => (e.id === target.earningId ? { ...e, [target.field]: target.newValue } : e)),
    );
    setDiscrepancies((prev) => prev.filter((d) => d !== target));
  }

  function handleDismissDiscrepancy(target) {
    setDiscrepancies((prev) => prev.filter((d) => d !== target));
  }

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
        <a href="?" className="text-xs text-gray-500">
          На главную
        </a>
      </div>

      <main className="space-y-4">
        <DiscrepancyBanner
          discrepancies={discrepancies}
          checkStatus={checkStatus}
          lastCheck={lastCheck}
          onApply={handleApplyDiscrepancy}
          onDismiss={handleDismissDiscrepancy}
        />

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
      </main>
    </div>
  );
}
