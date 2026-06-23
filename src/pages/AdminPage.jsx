import { useEffect, useState } from 'react';
import AdminLogin from '../components/admin/AdminLogin.jsx';
import AdminForm from '../components/admin/AdminForm.jsx';
import AdminGroupForm from '../components/admin/AdminGroupForm.jsx';
import AdminAddToGroupForm from '../components/admin/AdminAddToGroupForm.jsx';
import AdminGroupTable from '../components/admin/AdminGroupTable.jsx';
import AdminCompanyForm from '../components/admin/AdminCompanyForm.jsx';
import AdminCompanyTable from '../components/admin/AdminCompanyTable.jsx';
import DiscrepancyBanner from '../components/admin/DiscrepancyBanner.jsx';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { useAdminAuth } from '../hooks/useAdminAuth.js';
import { fetchEarningsDiscrepancies, shouldRunCheck } from '../utils/finnhubCheck.js';
import { groupByReportDate } from '../utils/groupEarnings.js';

// 'closed' | 'newCard' | 'addToGroup' | 'editGroup'
export default function AdminPage({ earnings, setEarnings, companies, onSaveCompany, onDeleteCompany }) {
  const { user, loading, logout } = useAdminAuth();
  const authed = Boolean(user);
  const [tab, setTab] = useState('cards');
  const [formMode, setFormMode] = useState('closed');
  const [editingGroupEarnings, setEditingGroupEarnings] = useState(null);
  const [editingCompanyTicker, setEditingCompanyTicker] = useState(null);
  const [companyFormOpen, setCompanyFormOpen] = useState(false);
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

  function handleToggleWebinarEnded(reportDate) {
    setEarnings((prev) => {
      const isEnded = prev.some((e) => e.reportDate === reportDate && e.webinarEnded);
      return prev.map((e) => (e.reportDate === reportDate ? { ...e, webinarEnded: !isEnded } : e));
    });
  }

  function handleDeleteGroup(reportDate) {
    setEarnings((prev) => prev.filter((e) => e.reportDate !== reportDate));
  }

  function handleEditCompany(ticker) {
    setEditingCompanyTicker(ticker);
    setCompanyFormOpen(true);
  }

  function closeCompanyForm() {
    setCompanyFormOpen(false);
    setEditingCompanyTicker(null);
  }

  function handleSaveCompany(company) {
    onSaveCompany(company);
    closeCompanyForm();
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

      <div className="flex border-b border-gray-200 bg-white rounded-t-md overflow-hidden">
        {[
          { key: 'cards', label: 'Карточки' },
          { key: 'companies', label: 'Компании' },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={
              'flex-1 py-3 text-sm font-semibold border-b-2 ' +
              (tab === t.key ? 'border-brand text-brand' : 'border-transparent text-gray-500')
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'cards' ? (
        <main className="space-y-4">
          <DiscrepancyBanner
            discrepancies={discrepancies}
            checkStatus={checkStatus}
            lastCheck={lastCheck}
            onApply={handleApplyDiscrepancy}
            onDismiss={handleDismissDiscrepancy}
          />

          {formMode === 'newCard' ? (
            <AdminForm editingEarning={null} companies={companies} onSave={handleSaveNewCard} onCancel={closeForm} />
          ) : formMode === 'addToGroup' ? (
            <AdminAddToGroupForm earnings={earnings} companies={companies} onSave={handleSaveAddToGroup} onCancel={closeForm} />
          ) : formMode === 'editGroup' ? (
            <AdminGroupForm groupEarnings={editingGroupEarnings} companies={companies} onSave={handleSaveGroup} onCancel={closeForm} />
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

          <AdminGroupTable
            earnings={earnings}
            onEdit={handleEditGroup}
            onToggleWebinarEnded={handleToggleWebinarEnded}
            onDeleteGroup={handleDeleteGroup}
          />
        </main>
      ) : (
        <main className="space-y-4">
          {companyFormOpen ? (
            <AdminCompanyForm
              editingCompany={companies.find((c) => c.ticker === editingCompanyTicker) || null}
              existingTickers={companies.map((c) => c.ticker)}
              onSave={handleSaveCompany}
              onCancel={closeCompanyForm}
            />
          ) : (
            <button
              type="button"
              onClick={() => setCompanyFormOpen(true)}
              className="w-full bg-brand text-white font-semibold rounded-md py-2.5 text-sm"
            >
              + Новая компания
            </button>
          )}

          <AdminCompanyTable companies={companies} onEdit={handleEditCompany} onDelete={onDeleteCompany} />
        </main>
      )}
    </div>
  );
}
