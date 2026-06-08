import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { MapPin, Link as LinkIcon, Users, Share2, ExternalLink, ImageOff, Clock } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { Navbar } from '../components/Navbar';
import { Skeleton, ProfileSkeleton } from '../components/Skeleton';
import { StatRow } from '../components/StatRow';
import { LanguageBar } from '../components/LanguageBar';
import { RepoCard } from '../components/RepoCard';
import { CommitChart } from '../components/CommitChart';
import { ChartModal } from '../components/ChartModal';
import { useChartImage } from '../hooks/useCharts';
import { chartsApi } from '../api/charts';
import { shareApi } from '../api/share';
import { formatNumber, formatAccountAge } from '../utils/formatters';
import toast from 'react-hot-toast';

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const { data, isLoading, error } = useProfile(username || '');
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (username) {
      document.title = `${username} — Gitlytics`;
    }
  }, [username]);

  const handleShare = useCallback(async () => {
    if (!username || isSharing) return;

    setIsSharing(true);
    try {
      const result = await shareApi.getShareUrl(username);
      await navigator.clipboard.writeText(result.url);
      toast.success('Link copied!', {
        icon: '📋',
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #2a2a2a',
        },
      });
    } catch {
      toast.error('Failed to share', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #2a2a2a',
        },
      });
    } finally {
      setIsSharing(false);
    }
  }, [username, isSharing]);

  if (error) {
    const errorMessage = (error as { response?: { status?: number } }).response?.status === 404
      ? `User "${username}" not found`
      : 'Failed to load profile. Please try again.';

    const isRateLimited = (error as { response?: { headers?: { get: (key: string) => string | null } } }).response?.headers?.get('Retry-After');
    if (isRateLimited) {
      return (
        <div className="min-h-screen bg-dark flex items-center justify-center">
          <div className="text-center px-6">
            <h2 className="font-syne font-bold text-2xl text-white mb-2">Rate Limited</h2>
            <p className="text-muted">
              GitHub rate limit hit. Try again in {isRateLimited} minute{isRateLimited !== '1' ? 's' : ''}.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-dark">
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 pt-32 pb-16">
          <div className="text-center">
            <h2 className="font-syne font-bold text-2xl text-white mb-2">{errorMessage}</h2>
            <Link to="/dashboard" className="text-accent hover:underline text-sm">
              Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-dark">
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 pt-32 pb-16">
          <ProfileSkeleton />
        </main>
      </div>
    );
  }

  const profile = data;
  const repos = data?.top_repos || [];
  const languages = data?.languages || [];
  const commit_stats = data?.commit_stats;
  const summary = data?.summary;
  const heatmapUrl = chartsApi.getHeatmapUrl(username!);

  const chartThumbnails = [
    { type: 'languages', title: 'Language Distribution', url: chartsApi.getLanguagesChartUrl(username!) },
    { type: 'stars', title: 'Stars by Repository', url: chartsApi.getStarsChartUrl(username!) },
    { type: 'commits', title: 'Commit History', url: chartsApi.getCommitsChartUrl(username!) },
  ];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={username}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-dark"
      >
        <Navbar />

        <main className="max-w-7xl mx-auto px-6 pt-32 pb-16">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <aside className="lg:col-span-1 space-y-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.35 }}
                  className="flex items-center gap-2 mb-6"
                >
                  <img
                    src={profile.avatar_url}
                    alt={profile.username}
                    className="w-20 h-20 rounded-full border border-dark-50"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    {profile.display_name && (
                      <h1 className="font-syne font-bold text-xl text-white truncate">
                        {profile.display_name}
                      </h1>
                    )}
                    <p className="font-mono text-muted text-sm truncate">@{profile.username}</p>
                  </div>
                </motion.div>

                {profile.bio && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.3 }}
                    className="text-sm text-muted leading-relaxed"
                  >
                    {profile.bio}
                  </motion.p>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="space-y-2 text-sm"
                >
                  {profile.location && (
                    <div className="flex items-center gap-2 text-muted">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.blog && (
                    <a
                      href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-muted hover:text-accent transition-colors duration-200"
                    >
                      <LinkIcon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{profile.blog}</span>
                    </a>
                  )}
                  <div className="flex items-center gap-4 text-muted">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span className="font-mono">{formatNumber(profile.followers)}</span>
                      <span className="text-xs">followers</span>
                    </div>
                    <span className="text-muted text-xs">·</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono">{formatNumber(profile.following)}</span>
                      <span className="text-xs">following</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-muted">
                    <Clock className="w-4 h-4" />
                    <span>Joined {new Date(profile.fetched_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  </div>
                </motion.div>

                <div className="border-t border-dark-50 pt-6 space-y-1">
                  <StatRow label="Total Repos" value={summary.total_repos} index={0} />
                  <StatRow label="Total Stars" value={summary.total_stars} index={1} formatValue={formatNumber} />
                  <StatRow label="Total Forks" value={summary.total_forks} index={2} formatValue={formatNumber} />
                  <StatRow label="Top Language" value={summary.top_language || 'N/A'} index={3} />
                  <StatRow label="Account Age" value={formatAccountAge(summary.account_age_days)} index={4} />
                  <StatRow label="Public Gists" value={summary.public_gists} index={5} />
                </div>

                <motion.button
                  onClick={handleShare}
                  disabled={isSharing}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-dark-100 border border-dark-50 rounded-sm text-sm hover:border-dark-400 transition-colors duration-200 disabled:opacity-50"
                  whileTap={{ scale: 0.98 }}
                >
                  <Share2 className="w-4 h-4" />
                  {isSharing ? 'Copying...' : 'Share Profile'}
                </motion.button>

                {languages.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.3 }}
                    className="border-t border-dark-50 pt-6"
                  >
                    <h3 className="font-syne font-semibold mb-4 text-sm">Languages</h3>
                    <div className="space-y-3">
                      {languages.slice(0, 10).map((lang, i) => (
                        <LanguageBar
                          key={lang.name}
                          name={lang.name}
                          percentage={lang.percentage}
                          index={i}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </aside>

              <div className="lg:col-span-2 space-y-8">
                {repos.length > 0 && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.35 }}
                  >
                    <h2 className="font-syne font-semibold text-lg mb-4">Top Repositories</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {repos.slice(0, 6).map((repo, i) => (
                        <RepoCard key={repo.id} repo={repo} index={i} />
                      ))}
                    </div>
                    {repos.length > 6 && (
                      <a
                        href={`https://github.com/${profile.username}?tab=repositories`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-4 text-sm text-muted hover:text-accent transition-colors duration-200"
                      >
                        View all repositories
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </motion.section>
                )}

                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.35 }}
                  className="bg-dark-100 border border-dark-50 rounded-sm p-6"
                >
                  <CommitChart data={commit_stats} />
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.35 }}
                >
                  <h2 className="font-syne font-semibold text-lg mb-4">Activity Heatmap</h2>
                  <HeatmapImage url={heatmapUrl} />
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55, duration: 0.35 }}
                >
                  <h2 className="font-syne font-semibold text-lg mb-4">Charts</h2>
                  <div className="grid grid-cols-3 gap-4">
                    {chartThumbnails.map((chart, i) => (
                      <ChartThumbnail
                        key={chart.type}
                        url={chart.url}
                        title={chart.title}
                        index={i}
                        onClick={() => setSelectedChart(chart.type)}
                      />
                    ))}
                  </div>
                </motion.section>
              </div>
            </div>
          </motion.div>
        </main>

        <ChartModal
          isOpen={!!selectedChart}
          onClose={() => setSelectedChart(null)}
          imageUrl={chartThumbnails.find((c) => c.type === selectedChart)?.url || ''}
          title={chartThumbnails.find((c) => c.type === selectedChart)?.title || ''}
        />
      </motion.div>
    </AnimatePresence>
  );
}

function HeatmapImage({ url }: { url: string }) {
  const { isLoading, error } = useChartImage(url);

  if (isLoading) {
    return (
      <div className="bg-dark-100 border border-dark-50 rounded-sm p-4">
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-dark-100 border border-dark-50 rounded-sm p-4 flex items-center justify-center gap-2 text-muted text-sm">
        <ImageOff className="w-4 h-4" />
        <span>Failed to load heatmap</span>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-dark-100 border border-dark-50 rounded-sm p-4 overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1, duration: 0.4 }}
    >
      <img
        src={url}
        alt="Activity Heatmap"
        className="max-w-full h-auto"
        loading="lazy"
      />
    </motion.div>
  );
}

function ChartThumbnail({ url, title, index, onClick }: { url: string; title: string; index: number; onClick: () => void }) {
  const { isLoading } = useChartImage(url);

  return (
    <motion.button
      onClick={onClick}
      className="relative bg-dark-100 border border-dark-50 rounded-sm p-3 hover:border-dark-400 transition-colors duration-200 text-left overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      {isLoading ? (
        <Skeleton className="h-20 w-full mb-2" />
      ) : (
        <img
          src={url}
          alt={title}
          className="h-20 w-full object-contain mb-2"
          loading="lazy"
        />
      )}
      <p className="text-xs text-muted truncate">{title}</p>
    </motion.button>
  );
}
