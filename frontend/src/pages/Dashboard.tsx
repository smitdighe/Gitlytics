import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ArrowRight, X, Clock } from 'lucide-react';
import { Navbar } from '../components/Navbar';

const RECENT_SEARCHES_KEY = 'gitlytics_recent_searches';
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
  } catch {
    return [];
  }
}

function addRecentSearch(username: string) {
  const recent = getRecentSearches().filter((u) => u !== username);
  recent.unshift(username);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [compareUser1, setCompareUser1] = useState('');
  const [compareUser2, setCompareUser2] = useState('');
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
    document.title = 'Dashboard — Gitlytics';
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      addRecentSearch(trimmed);
      navigate(`/profile/${encodeURIComponent(trimmed)}`);
    }
  }, [searchQuery, navigate]);

  const handleRecentClick = useCallback((username: string) => {
    navigate(`/profile/${encodeURIComponent(username)}`);
  }, [navigate]);

  const handleCompare = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const u1 = compareUser1.trim();
    const u2 = compareUser2.trim();
    if (u1 && u2) {
      navigate(`/compare?u1=${encodeURIComponent(u1)}&u2=${encodeURIComponent(u2)}`);
    }
  }, [compareUser1, compareUser2, navigate]);

  const clearRecentSearch = useCallback((username: string) => {
    const recent = getRecentSearches().filter((u) => u !== username);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
    setRecentSearches(recent);
  }, []);

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-16"
        >
          <h1 className="font-syne font-bold text-3xl mb-2 text-center">
            Search a GitHub Profile
          </h1>
          <p className="text-muted text-center mb-8">
            Enter a username to view detailed analytics
          </p>

          <form onSubmit={handleSearch}>
            <motion.div
              className={`relative transition-all duration-300 ${
                isFocused ? 'max-w-xl mx-auto' : ''
              }`}
              animate={{ scale: isFocused ? 1.02 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Enter GitHub username..."
                className="w-full bg-dark-100 border border-dark-50 rounded-sm py-4 pl-12 pr-12 text-white font-mono focus:border-dark-400 focus:outline-none transition-colors duration-200"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent text-dark rounded-sm hover:bg-accent/90 transition-colors duration-200"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </form>

          <p className="text-muted text-xs text-center mt-3">
            Press <kbd className="px-1.5 py-0.5 bg-dark-100 border border-dark-50 rounded-sm font-mono">/</kbd> to focus
          </p>
        </motion.div>

        {recentSearches.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="mb-16"
          >
            <h2 className="font-syne font-semibold text-lg mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted" />
              Recent Searches
            </h2>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((username, index) => (
                <motion.button
                  key={username}
                  onClick={() => handleRecentClick(username)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  className="group flex items-center gap-1.5 px-3 py-1.5 bg-dark-100 border border-dark-50 rounded-sm hover:border-dark-400 transition-all duration-200 font-mono text-sm"
                >
                  <span className="text-white">{username}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearRecentSearch(username);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-muted hover:text-error transition-all duration-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.button>
              ))}
            </div>
          </motion.section>
        )}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
        >
          <h2 className="font-syne font-semibold text-lg mb-4">
            Compare Two Users
          </h2>
          <form onSubmit={handleCompare} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={compareUser1}
                onChange={(e) => setCompareUser1(e.target.value)}
                placeholder="Username 1"
                className="w-full bg-dark-100 border border-dark-50 rounded-sm py-3 px-4 text-white font-mono focus:border-dark-400 focus:outline-none transition-colors duration-200"
              />
            </div>
            <span className="text-muted text-center sm:text-left">vs</span>
            <div className="flex-1 relative">
              <input
                type="text"
                value={compareUser2}
                onChange={(e) => setCompareUser2(e.target.value)}
                placeholder="Username 2"
                className="w-full bg-dark-100 border border-dark-50 rounded-sm py-3 px-4 text-white font-mono focus:border-dark-400 focus:outline-none transition-colors duration-200"
              />
            </div>
            <motion.button
              type="submit"
              disabled={!compareUser1.trim() || !compareUser2.trim()}
              className="py-3 px-6 bg-accent text-dark font-semibold rounded-sm hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Compare
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </form>
        </motion.section>
      </main>
    </div>
  );
}
