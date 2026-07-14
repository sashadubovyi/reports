import { useEffect, useState } from 'react';
import LandingPage from './pages/LandingPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import Q1ReportPage from './pages/Q1ReportPage.jsx';
import MissedProfitPage from './pages/MissedProfitPage.jsx';
import { useFirestoreEarnings } from './hooks/useFirestoreEarnings.js';
import { useFirestoreCompanies } from './hooks/useFirestoreCompanies.js';
import { INITIAL_EARNINGS } from './data/initialEarnings.js';

// /q1report is reachable via the global Header season switcher; ?page=admin
// is checked first so the admin link still works while on /q1report.
function getPageFromLocation() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('page') === 'admin') return 'admin';
  if (window.location.pathname === '/q1report') return 'q1report';
  if (window.location.pathname === '/test') return 'missedprofit';
  return 'landing';
}

export default function App() {
  const [page, setPage] = useState(getPageFromLocation);
  const [earnings, setEarnings] = useFirestoreEarnings(INITIAL_EARNINGS);
  const { companies, saveCompany, deleteCompany } = useFirestoreCompanies();

  useEffect(() => {
    function handlePopState() {
      setPage(getPageFromLocation());
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Intercept in-app `?page=admin` / `?` links so navigation doesn't force a
  // full page reload (important for slow old devices), while still keeping
  // plain query-param URLs as the routing mechanism.
  useEffect(() => {
    function handleClick(e) {
      const anchor = e.target.closest && e.target.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('?')) return;
      e.preventDefault();
      window.history.pushState({}, '', href);
      setPage(getPageFromLocation());
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (page === 'q1report') {
    return <Q1ReportPage />;
  }

  if (page === 'missedprofit') {
    return <MissedProfitPage />;
  }

  if (page === 'admin') {
    return (
      <AdminPage
        earnings={earnings}
        setEarnings={setEarnings}
        companies={companies}
        onSaveCompany={saveCompany}
        onDeleteCompany={deleteCompany}
      />
    );
  }

  return <LandingPage earnings={earnings} companies={companies} />;
}
