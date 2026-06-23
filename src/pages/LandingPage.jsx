import { useState } from 'react';
import Header from '../components/Header.jsx';
import SearchBar from '../components/SearchBar.jsx';
import FilterTabs from '../components/FilterTabs.jsx';
import EarningsList from '../components/EarningsList.jsx';
import NewsList from '../components/NewsList.jsx';
import Footer from '../components/Footer.jsx';
import { useNewsFeed } from '../hooks/useNewsFeed.js';

export default function LandingPage({ earnings }) {
  const [filter, setFilter] = useState('upcoming');
  const [search, setSearch] = useState('');
  const { status: newsStatus, articles: newsArticles } = useNewsFeed(filter === 'news');

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <SearchBar value={search} onChange={setSearch} />
      <FilterTabs activeTab={filter} onChange={setFilter} />
      <main>
        {filter === 'news' ? (
          <NewsList status={newsStatus} articles={newsArticles} search={search} />
        ) : (
          <EarningsList earnings={earnings} filter={filter} search={search} />
        )}
      </main>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
