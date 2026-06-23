import { useEffect, useState } from 'react';
import AdminLogin from '../components/admin/AdminLogin.jsx';
import AdminForm from '../components/admin/AdminForm.jsx';
import AdminGroupForm from '../components/admin/AdminGroupForm.jsx';
import AdminAddToGroupForm from '../components/admin/AdminAddToGroupForm.jsx';
import AdminGroupTable from '../components/admin/AdminGroupTable.jsx';
import DiscrepancyBanner from '../components/admin/DiscrepancyBanner.jsx';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { useAdminAuth } from '../hooks/useAdminAuth.js';
import { fetchEarningsDiscrepancies, shouldRunCheck } from '../utils/finnhubCheck.js';
import { groupByReportDate } from '../utils/groupEarnings.js';

// 'closed' | 'newCard' | 'addToGroup' | 'editGroup'
export default function AdminPage({ earnings, setEarnings }) {
  const { user, loading, logout } = useAdminAuth();
  const authed = Boolean(user);
  const [formMode, setFormMode] = useState('closed');
  const [editingGroupEarnings, setEditingGroupEarnings] = useState(null);
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

  function closeForm() {
    setFormMode('closed');
    setEditingGroupEarnings(null);
  }

  function handleSaveNewCard(data) {
    setEarnings((prev) => [...prev, data]);
    closeForm();
  }

  function handleSaveAddToGroup(data) {
    setEarnings((prev) => [...prev, data]);
    closeForm();
  }

  function handleEditGroup(reportDate) {
    const groups = groupByReportDate(earnings);
    setEditingGroupEarnings(groups.get(reportDate) || []);
    setFormMode('editGroup');
  }

  // Replaces the original group's member records (snapshotted in
  // editingGroupEarnings) with the dialog's returned set in one atomic
  // update, so edits, additions, and removals all land together.
  function handleSaveGroup(updatedGroupEarnings) {
    const originalIds = new Set(editingGroupEarnings.map((e) => e.id));
    setEarnings((prev) => [...prev.filter((e) => !originalIds.has(e.id)), ...updatedGroupEarnings]);
    closeForm();
  }

  if (loading) {
    return null;
  }

  if (!authed) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Админ-панель</h1>
        <div className="flex items-center gap-3">
          <a href="?" className="text-xs text-gray-500">
            На главную
          </a>
          <button type="button" onClick={logout} className="text-xs text-gray-500">
            Выйти
          </button>
        </div>
      </div>

      <main className="space-y-4">
        <DiscrepancyBanner
          discrepancies={discrepancies}
          checkStatus={checkStatus}
          lastCheck={lastCheck}
          onApply={handleApplyDiscrepancy}
          onDismiss={handleDismissDiscrepancy}
        />

        {formMode === 'newCard' ? (
          <AdminForm editingEarning={null} onSave={handleSaveNewCard} onCancel={closeForm} />
        ) : formMode === 'addToGroup' ? (
          <AdminAddToGroupForm earnings={earnings} onSave={handleSaveAddToGroup} onCancel={closeForm} />
        ) : formMode === 'editGroup' ? (
          <AdminGroupForm groupEarnings={editingGroupEarnings} onSave={handleSaveGroup} onCancel={closeForm} />
        ) : (
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setFormMode('newCard')}
              className="flex-1 bg-brand text-white font-semibold rounded-md py-2.5 text-sm"
            >
              + Новая карточка
            </button>
            <button
              type="button"
              onClick={() => setFormMode('addToGroup')}
              className="flex-1 bg-gray-100 text-gray-700 font-semibold rounded-md py-2.5 text-sm"
            >
              + В существующую группу
            </button>
          </div>
        )}

        <AdminGroupTable earnings={earnings} onEdit={handleEditGroup} />
      </main>
    </div>
  );
}
