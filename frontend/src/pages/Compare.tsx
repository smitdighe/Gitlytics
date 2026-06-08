import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft, Equal } from 'lucide-react';
import { useCompare } from '../hooks/useCompare';
import { Navbar } from '../components/Navbar';
import { CompareSkeleton } from '../components/Skeleton';
import { formatNumber, formatAccountAge } from '../utils/formatters';
import { languageColors } from '../utils/languageColors';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const u1Param = searchParams.get('u1') || '';
  const u2Param = searchParams.get('u2') || '';

  const [user1Input, setUser1Input] = useState(u1Param);
  const [user2Input, setUser2Input] = useState(u2Param);

  const debouncedUser1 = useDebounce(user1Input, 300);
  const debouncedUser2 = useDebounce(user2Input, 300);

  useEffect(() => {
    if (debouncedUser1.trim() && debouncedUser2.trim()) {
      setSearchParams({ u1: debouncedUser1.trim(), u2: debouncedUser2.trim() });
    } else if (!debouncedUser1.trim() && !debouncedUser2.trim()) {
      setSearchParams({});
    }
  }, [debouncedUser1, debouncedUser2, setSearchParams]);

  const shouldFetch = u1Param && u2Param;
  const { data, isLoading, error } = useCompare(
    shouldFetch ? u1Param : '',
    shouldFetch ? u2Param : ''
  );

  useEffect(() => {
    document.title = shouldFetch ? `${u1Param} vs ${u2Param} — Gitlytics` : 'Compare — Gitlytics';
  }, [shouldFetch, u1Param, u2Param]);

  const handleNewComparison = useCallback(() => {
    setUser1Input('');
    setUser2Input('');
    setSearchParams({});
  }, [setSearchParams]);

  if (!shouldFetch) {
    return (
      <div className="min-h-screen bg-dark">
        <Navbar />
        <main className="max-w-3xl mx-auto px-6 pt-32 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <h1 className="font-syne font-bold text-3xl mb-2 text-center">
              Compare GitHub Users
            </h1>
            <p className="text-muted text-center mb-8">
              Enter two usernames to compare their profiles
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm text-muted mb-2">First User</label>
                <input
                  type="text"
                  value={user1Input}
                  onChange={(e) => setUser1Input(e.target.value)}
                  placeholder="e.g., torvalds"
                  className="w-full bg-dark-100 border border-dark-50 rounded-sm py-3 px-4 text-white font-mono focus:border-dark-400 focus:outline-none transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm text-muted mb-2">Second User</label>
                <input
                  type="text"
                  value={user2Input}
                  onChange={(e) => setUser2Input(e.target.value)}
                  placeholder="e.g., gaearon"
                  className="w-full bg-dark-100 border border-dark-50 rounded-sm py-3 px-4 text-white font-mono focus:border-dark-400 focus:outline-none transition-colors duration-200"
                />
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark">
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 pt-32 pb-16">
          <div className="text-center">
            <h2 className="font-syne font-bold text-2xl text-white mb-2">
              Failed to load comparison
            </h2>
            <p className="text-muted mb-4">
              One or both users could not be found or compared.
            </p>
            <button
              onClick={handleNewComparison}
              className="text-accent hover:underline text-sm"
            >
              Try again
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-dark">
        <Navbar />
        <main className="max-w-4xl mx-auto px-6 pt-32 pb-16">
          <CompareSkeleton />
        </main>
      </div>
    );
  }

  const stats = [
    { label: 'Total Stars', u1Value: data.stats.total_stars.user1, u2Value: data.stats.total_stars.user2, winner: data.stats.total_stars.winner },
    { label: 'Total Repos', u1Value: data.stats.total_repos.user1, u2Value: data.stats.total_repos.user2, winner: data.stats.total_repos.winner },
    { label: 'Total Forks', u1Value: data.stats.total_forks.user1, u2Value: data.stats.total_forks.user2, winner: data.stats.total_forks.winner },
    { label: 'Followers', u1Value: data.stats.followers.user1, u2Value: data.stats.followers.user2, winner: data.stats.followers.winner },
    { label: 'Total Commits', u1Value: data.stats.total_commits.user1, u2Value: data.stats.total_commits.user2, winner: data.stats.total_commits.winner },
    { label: 'Account Age (days)', u1Value: formatAccountAge(data.stats.account_age_days.user1), u2Value: formatAccountAge(data.stats.account_age_days.user2), winner: data.stats.account_age_days.winner, isString: true },
    { label: 'Top Language', u1Value: data.stats.top_language.user1, u2Value: data.stats.top_language.user2, winner: null, isLanguage: true },
  ];

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${u1Param}-${u2Param}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35 }}
          >
            <div className="flex justify-center mb-8">
              <button
                onClick={handleNewComparison}
                className="flex items-center gap-1 text-muted hover:text-white text-sm transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                New Comparison
              </button>
            </div>

            <div className="flex justify-around items-center mb-12">
              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <img
                  src={`https://github.com/${data.user1}.png`}
                  alt={data.user1}
                  className="w-16 h-16 rounded-full border border-dark-50"
                  loading="lazy"
                />
                <p className="font-mono text-white font-semibold">@{data.user1}</p>
              </motion.div>

              <motion.span
                className="text-muted font-mono text-lg"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                VS
              </motion.span>

              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <p className="font-mono text-white font-semibold">@{data.user2}</p>
                <img
                  src={`https://github.com/${data.user2}.png`}
                  alt={data.user2}
                  className="w-16 h-16 rounded-full border border-dark-50"
                  loading="lazy"
                />
              </motion.div>
            </div>

            <div className="border border-dark-50 rounded-sm overflow-hidden">
              <div className="grid grid-cols-[1fr_100px_auto_100px_1fr] bg-dark-100 border-b border-dark-50">
                <div className="py-3 px-4 text-right text-sm font-mono text-white font-semibold">
                  @{data.user1}
                </div>
                <div></div>
                <div className="py-3 px-2 text-center text-xs text-muted">
                  Stat
                </div>
                <div></div>
                <div className="py-3 px-4 text-left text-sm font-mono text-white font-semibold">
                  @{data.user2}
                </div>
              </div>

              {stats.map((stat, index) => {
                const u1Win = stat.winner === 'user1';
                const u2Win = stat.winner === 'user2';
                const isTie = stat.winner === 'tie';

                return (
                  <motion.div
                    key={stat.label}
                    className={`grid grid-cols-[1fr_100px_auto_100px_1fr] ${
                      index % 2 === 0 ? 'bg-dark' : 'bg-dark-100'
                    }`}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 + 0.2, duration: 0.35 }}
                  >
                    <div className={`py-3 px-4 text-right font-mono text-sm ${u1Win ? 'text-accent font-semibold' : 'text-white'}`}>
                      {stat.isLanguage && stat.u1Value ? (
                        <span className="flex items-center justify-end gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: languageColors[stat.u1Value as string] || '#666' }} />
                          {stat.u1Value}
                        </span>
                      ) : (
                        typeof stat.u1Value === 'number' ? formatNumber(stat.u1Value) : stat.u1Value || 'N/A'
                      )}
                    </div>
                    <div className="py-3 px-2 flex justify-end items-center">
                      {u1Win && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.05 + 0.4, type: 'spring' }}
                        >
                          <ChevronLeft className="w-5 h-5 text-accent" />
                        </motion.div>
                      )}
                    </div>
                    <div className="py-3 px-2 text-center text-xs text-muted flex items-center justify-center">
                      {isTie ? (
                        <Equal className="w-4 h-4 text-muted" />
                      ) : stat.isLanguage ? (
                        <span>—</span>
                      ) : (
                        stat.label
                      )}
                    </div>
                    <div className="py-3 px-2 flex justify-start items-center">
                      {u2Win && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.05 + 0.4, type: 'spring' }}
                        >
                          <ChevronRight className="w-5 h-5 text-accent" />
                        </motion.div>
                      )}
                    </div>
                    <div className={`py-3 px-4 text-left font-mono text-sm ${u2Win ? 'text-accent font-semibold' : 'text-white'}`}>
                      {stat.isLanguage && stat.u2Value ? (
                        <span className="flex items-center justify-start gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: languageColors[stat.u2Value as string] || '#666' }} />
                          {stat.u2Value}
                        </span>
                      ) : (
                        typeof stat.u2Value === 'number' ? formatNumber(stat.u2Value) : stat.u2Value || 'N/A'
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex justify-around gap-8 mt-8">
              <Link
                to={`/profile/${data.user1}`}
                className="text-sm text-muted hover:text-accent transition-colors duration-200 flex items-center gap-1"
              >
                View @{data.user1}'s Profile
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                to={`/profile/${data.user2}`}
                className="text-sm text-muted hover:text-accent transition-colors duration-200 flex items-center gap-1"
              >
                View @{data.user2}'s Profile
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}