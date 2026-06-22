import { useState } from 'react';
import Header from '../components/Header.jsx';
import FilterTabs from '../components/FilterTabs.jsx';
import EarningsList from '../components/EarningsList.jsx';

export default function LandingPage({ earnings }) {
  const [filter, setFilter] = useState('upcoming');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <FilterTabs activeTab={filter} onChange={setFilter} />
      <EarningsList earnings={earnings} filter={filter} />
      <footer className="text-center text-xs text-gray-400 py-6">
        <a href="?page=admin">Admin</a>
      </footer>
    </div>
  );
}
