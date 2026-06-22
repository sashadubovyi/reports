import { useState } from 'react';
import Header from '../components/Header.jsx';
import FilterTabs from '../components/FilterTabs.jsx';
import EarningsList from '../components/EarningsList.jsx';

export default function LandingPage({ earnings }) {
  const [filter, setFilter] = useState('upcoming');

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <FilterTabs activeTab={filter} onChange={setFilter} />
      <EarningsList earnings={earnings} filter={filter} />
      <footer className="text-center py-6">
        <a href="?page=admin" className="inline-block">
          <img src="/minilogo.png" alt="Admin" className="h-5 w-5 mx-auto grayscale opacity-40" />
        </a>
      </footer>
    </div>
  );
}
