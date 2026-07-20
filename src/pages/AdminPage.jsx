import { useEffect, useState } from 'react';
import AdminLogin from '../components/admin/AdminLogin.jsx';
import AdminForm from '../components/admin/AdminForm.jsx';
import AdminGroupForm from '../components/admin/AdminGroupForm.jsx';
import AdminAddToGroupForm from '../components/admin/AdminAddToGroupForm.jsx';
import AdminGroupTable from '../components/admin/AdminGroupTable.jsx';
import AdminCompanyForm from '../components/admin/AdminCompanyForm.jsx';
import AdminCompanyTable from '../components/admin/AdminCompanyTable.jsx';
import AdminTradingHistoryForm from '../components/admin/AdminTradingHistoryForm.jsx';
import AdminTradingHistoryTable from '../components/admin/AdminTradingHistoryTable.jsx';
import DiscrepancyBanner from '../components/admin/DiscrepancyBanner.jsx';
import Modal from '../components/Modal.jsx';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { useAdminAuth } from '../hooks/useAdminAuth.js';
import { useFirestoreQ1Earnings } from '../hooks/useFirestoreQ1Earnings.js';
import { useFirestoreTradingHistory } from '../hooks/useFirestoreTradingHistory.js';
import { fetchEarningsDiscrepancies, shouldRunCheck } from '../utils/finnhubCheck.js';
import { calculateWebinarDate, deriveQuarterLabel } from '../utils/dateUtils.js';
import { findActiveEarning, getGroupSharedFields, groupByWebinarDate } from '../utils/groupEarnings.js';

// 'closed' | 'newCard' | 'addToGroup' | 'editGroup'
export default function AdminPage({ earnings, setEarnings, companies, onSaveCompany, onDeleteCompany }) {
  const { user, loading, logout } = useAdminAuth();
  const authed = Boolean(user);
  // Q1 2026 lives in its own Firestore collection (see useFirestoreQ1Earnings),
  // so switching seasons here just swaps which earnings/setEarnings pair the
  // Cards tab operates on — it's physically impossible for this to touch
  // live Q2 data while 'Q1-2026' is selected.
  const [activeSeason, setActiveSeason] = useState('Q2-2026');
  const [q1Earnings, setQ1Earnings] = useFirestoreQ1Earnings();
  const activeEarnings = activeSeason === 'Q1-2026' ? q1Earnings : earnings;
  const setActiveEarnings = activeSeason === 'Q1-2026' ? setQ1Earnings : setEarnings;
  const [tradingHistory, setTradingHistory] = useFirestoreTradingHistory(activeSeason);
  const [tab, setTab] = useState('cards');
  const [formMode, setFormMode] = useState('closed');
  const [editingGroupEarnings, setEditingGroupEarnings] = useState(null);
  const [editingCompanyTicker, setEditingCompanyTicker] = useState(null);
  const [editingCompanyEarning, setEditingCompanyEarning] = useState(null);
  const [companyFormOpen, setCompanyFormOpen] = useState(false);
  const [editingHistoryPointId, setEditingHistoryPointId] = useState(null);
  const [historyFormOpen, setHistoryFormOpen] = useState(false);
  const [lastCheck, setLastCheck] = useLocalStorage('otkritie-finnhub-last-check', null);
  const [discrepancies, setDiscrepancies] = useLocalStorage('otkritie-finnhub-discrepancies', []);
  const [checkStatus, setCheckStatus] = useState(null);

  useEffect(() => {
    // Q1 2026 is a frozen archive — checking it against the live Finnhub
    // feed doesn't make sense, so the check only ever runs for live Q2 data.
    if (!authed || activeSeason !== 'Q2-2026' || !shouldRunCheck(lastCheck)) return;
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
  }, [authed, activeSeason]);

  function handleApplyDiscrepancy(target) {
    setEarnings((prev) =>
      prev.map((e) => (e.id === target.earningId ? { ...e, [target.field]: target.newValue } : e)),
    );
    setDiscrepancies((prev) => prev.filter((d) => d !== target));
  }

  function handleDismissDiscrepancy(target) {
    setDiscrepancies((prev) => prev.filter((d) => d !== target));
  }

  function handleApplyAllDiscrepancies() {
    setEarnings((prev) =>
      prev.map((e) => {
        const updates = discrepancies.filter((d) => d.earningId === e.id);
        return updates.length ? updates.reduce((acc, d) => ({ ...acc, [d.field]: d.newValue }), e) : e;
      }),
    );
    setDiscrepancies([]);
  }

  function handleIgnoreAllDiscrepancies() {
    setDiscrepancies([]);
  }

  function closeForm() {
    setFormMode('closed');
    setEditingGroupEarnings(null);
  }

  function handleSaveNewCard(data) {
    setActiveEarnings((prev) => [...prev, data]);
    closeForm();
  }

  function handleSaveAddToGroup(data) {
    setActiveEarnings((prev) => [...prev, data]);
    closeForm();
  }

  // Groups are keyed by WEBINAR date everywhere in the admin now — the same
  // grouping the site renders — so every action below maps 1:1 to one card.
  function handleEditGroup(webinarDate) {
    const groups = groupByWebinarDate(activeEarnings);
    setEditingGroupEarnings(groups.get(webinarDate) || []);
    setFormMode('editGroup');
  }

  function handleToggleWebinarEnded(webinarDate) {
    setActiveEarnings((prev) => {
      const inGroup = (e) => calculateWebinarDate(e.reportDate, e.marketTiming) === webinarDate;
      const isEnded = prev.some((e) => inGroup(e) && e.webinarEnded);
      return prev.map((e) => (inGroup(e) ? { ...e, webinarEnded: !isEnded } : e));
    });
  }

  function handleDeleteGroup(webinarDate) {
    setActiveEarnings((prev) =>
      prev.filter((e) => calculateWebinarDate(e.reportDate, e.marketTiming) !== webinarDate),
    );
  }

  function handleEditCompany(ticker) {
    setEditingCompanyTicker(ticker);
    setEditingCompanyEarning(findActiveEarning(activeEarnings, ticker));
    setCompanyFormOpen(true);
  }

  function closeCompanyForm() {
    setCompanyFormOpen(false);
    setEditingCompanyTicker(null);
    setEditingCompanyEarning(null);
  }

  // Moves a ticker's active (upcoming, not-ended) card to match the date set
  // in the Companies tab: updates EPS/revenue in place if the date didn't
  // change, otherwise joins (or creates) the webinar group for the new date.
  // reportDate always stores the raw selected calendar date here — same
  // convention as the Cards tab (AdminForm/AdminAddToGroupForm/AdminGroupForm)
  // — so the home page's webinar-date grouping can safely derive the webinar
  // date from any live card without double-shifting AMC entries. Only the
  // *group-matching* (which existing group this card should join) uses the
  // computed webinar date, since that's what visually groups cards together.
  function migrateCompanyEarning(ticker, previousEarning, newDate, marketTime, epsEstimate, revenueEstimate) {
    if (!newDate) {
      if (previousEarning) {
        setActiveEarnings((prev) => prev.filter((e) => e.id !== previousEarning.id));
      }
      return;
    }

    const targetWebinarDate = calculateWebinarDate(newDate, marketTime);

    if (previousEarning && previousEarning.reportDate === newDate && previousEarning.marketTiming === marketTime) {
      setActiveEarnings((prev) =>
        prev.map((e) =>
          e.id === previousEarning.id ? { ...e, marketTiming: marketTime, epsEstimate, revenueEstimate } : e,
        ),
      );
      return;
    }

    setActiveEarnings((prev) => {
      const destinationGroup = prev.filter(
        (e) => e.id !== previousEarning?.id && calculateWebinarDate(e.reportDate, e.marketTiming) === targetWebinarDate,
      );
      const shared = getGroupSharedFields(destinationGroup);
      const movedEntry = {
        id: previousEarning?.id || `e-${Date.now()}`,
        ticker,
        quarter: deriveQuarterLabel(newDate),
        reportDate: newDate,
        marketTiming: marketTime,
        epsEstimate,
        revenueEstimate,
        gapDollar: '',
        gapPercent: '',
        registrationUrl: shared.registrationUrl,
        recordingUrl: shared.recordingUrl,
        webinarEnded: shared.webinarEnded,
        webinarTime: shared.webinarTime,
      };
      return previousEarning
        ? prev.map((e) => (e.id === previousEarning.id ? movedEntry : e))
        : [...prev, movedEntry];
    });
  }

  function handleSaveCompany(formResult) {
    const { reportDate, marketTime, epsEstimate, revenueEstimate, ...company } = formResult;
    onSaveCompany(company);
    migrateCompanyEarning(company.ticker, editingCompanyEarning, reportDate, marketTime, epsEstimate, revenueEstimate);
    closeCompanyForm();
  }

  // Replaces the original group's member records (snapshotted in
  // editingGroupEarnings) with the dialog's returned set in one atomic
  // update, so edits, additions, and removals all land together.
  function handleSaveGroup(updatedGroupEarnings) {
    const originalIds = new Set(editingGroupEarnings.map((e) => e.id));
    setActiveEarnings((prev) => [...prev.filter((e) => !originalIds.has(e.id)), ...updatedGroupEarnings]);
    closeForm();
  }

  function handleEditHistoryPoint(id) {
    setEditingHistoryPointId(id);
    setHistoryFormOpen(true);
  }

  function closeHistoryForm() {
    setHistoryFormOpen(false);
    setEditingHistoryPointId(null);
  }

  function handleSaveHistoryPoint(data) {
    setTradingHistory((prev) => {
      const exists = prev.some((p) => p.id === data.id);
      return exists ? prev.map((p) => (p.id === data.id ? data : p)) : [...prev, data];
    });
    closeHistoryForm();
  }

  function handleDeleteHistoryPoint(id) {
    setTradingHistory((prev) => prev.filter((p) => p.id !== id));
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
          <select
            value={activeSeason}
            onChange={(e) => setActiveSeason(e.target.value)}
            className="text-xs font-semibold text-brand bg-blue-50 border border-blue-200 rounded-md px-2 py-1.5"
          >
            <option value="Q1-2026">Q1 2026</option>
            <option value="Q2-2026">Q2 2026</option>
          </select>
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
          { key: 'history', label: 'История' },
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
            onApplyAll={handleApplyAllDiscrepancies}
            onIgnoreAll={handleIgnoreAllDiscrepancies}
          />

          {formMode === 'newCard' ? (
            <AdminForm editingEarning={null} companies={companies} onSave={handleSaveNewCard} onCancel={closeForm} />
          ) : formMode === 'addToGroup' ? (
            <AdminAddToGroupForm earnings={activeEarnings} companies={companies} onSave={handleSaveAddToGroup} onCancel={closeForm} />
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

          <Modal open={formMode === 'editGroup'} onClose={closeForm}>
            <AdminGroupForm groupEarnings={editingGroupEarnings} companies={companies} onSave={handleSaveGroup} onCancel={closeForm} />
          </Modal>

          <AdminGroupTable
            earnings={activeEarnings}
            onEdit={handleEditGroup}
            onToggleWebinarEnded={handleToggleWebinarEnded}
            onDeleteGroup={handleDeleteGroup}
          />
        </main>
      ) : tab === 'history' ? (
        <main className="space-y-4">
          {historyFormOpen && !editingHistoryPointId ? (
            <AdminTradingHistoryForm
              editingPoint={null}
              companies={companies}
              onSave={handleSaveHistoryPoint}
              onCancel={closeHistoryForm}
            />
          ) : (
            <button
              type="button"
              onClick={() => setHistoryFormOpen(true)}
              className="w-full bg-brand text-white font-semibold rounded-md py-2.5 text-sm"
            >
              + Новая точка истории
            </button>
          )}

          <Modal open={historyFormOpen && Boolean(editingHistoryPointId)} onClose={closeHistoryForm}>
            <AdminTradingHistoryForm
              editingPoint={tradingHistory.find((p) => p.id === editingHistoryPointId) || null}
              companies={companies}
              onSave={handleSaveHistoryPoint}
              onCancel={closeHistoryForm}
            />
          </Modal>

          <AdminTradingHistoryTable points={tradingHistory} onEdit={handleEditHistoryPoint} onDelete={handleDeleteHistoryPoint} />
        </main>
      ) : (
        <main className="space-y-4">
          {companyFormOpen && !editingCompanyTicker ? (
            <AdminCompanyForm
              editingCompany={null}
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

          <Modal open={companyFormOpen && Boolean(editingCompanyTicker)} onClose={closeCompanyForm}>
            <AdminCompanyForm
              editingCompany={companies.find((c) => c.ticker === editingCompanyTicker) || null}
              existingTickers={companies.map((c) => c.ticker)}
              activeEarning={editingCompanyEarning}
              onSave={handleSaveCompany}
              onCancel={closeCompanyForm}
            />
          </Modal>

          <AdminCompanyTable companies={companies} onEdit={handleEditCompany} onDelete={onDeleteCompany} />
        </main>
      )}
    </div>
  );
}
