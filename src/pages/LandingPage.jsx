import { useState } from 'react';
import Header from '../components/Header.jsx';
import SearchBar from '../components/SearchBar.jsx';
import FilterTabs from '../components/FilterTabs.jsx';
import EarningsList from '../components/EarningsList.jsx';
import TradingHistoryView from '../components/TradingHistoryView.jsx';
import VideoOnlyToggle from '../components/VideoOnlyToggle.jsx';
import Footer from '../components/Footer.jsx';

export default function LandingPage({ earnings, companies }) {
  const [filter, setFilter] = useState('upcoming');
  const [search, setSearch] = useState('');
  const [videoOnly, setVideoOnly] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <SearchBar value={search} onChange={setSearch} />
      <FilterTabs activeTab={filter} onChange={setFilter} />
      {filter === 'past' ? <VideoOnlyToggle checked={videoOnly} onChange={setVideoOnly} /> : null}
      <main>
        {filter === 'history' ? (
          <TradingHistoryView season="Q2-2026" />
        ) : (
          <EarningsList earnings={earnings} filter={filter} search={search} companies={companies} videoOnly={videoOnly} />
        )}
      </main>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
