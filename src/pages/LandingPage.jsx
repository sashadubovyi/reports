import { useState } from 'react';
import Header from '../components/Header.jsx';
import FilterTabs from '../components/FilterTabs.jsx';
import EarningsList from '../components/EarningsList.jsx';
import Footer from '../components/Footer.jsx';

export default function LandingPage({ earnings }) {
  const [filter, setFilter] = useState('upcoming');

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <FilterTabs activeTab={filter} onChange={setFilter} />
      <main>
        <EarningsList earnings={earnings} filter={filter} />
      </main>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
