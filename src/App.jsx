import { useEffect, useState } from 'react';
import LandingPage from './pages/LandingPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { INITIAL_EARNINGS } from './data/initialEarnings.js';

function getPageFromLocation() {
  const params = new URLSearchParams(window.location.search);
  return params.get('page') === 'admin' ? 'admin' : 'landing';
}

export default function App() {
  const [page, setPage] = useState(getPageFromLocation);
  const [earnings, setEarnings] = useLocalStorage('otkritie-earnings', INITIAL_EARNINGS);

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

  if (page === 'admin') {
    return <AdminPage earnings={earnings} setEarnings={setEarnings} />;
  }

  return <LandingPage earnings={earnings} />;
}
