import { motion } from 'framer-motion';
import { Star, GitFork, ExternalLink } from 'lucide-react';
import { GitHubRepo } from '../api/profile';
import { languageColors } from '../utils/languageColors';
import { formatNumber } from '../utils/formatters';

interface RepoCardProps {
  repo: GitHubRepo;
  index: number;
}

export function RepoCard({ repo, index }: RepoCardProps) {
  const langColor = repo.language ? languageColors[repo.language] : null;

  return (
    <motion.a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 bg-dark-100 border border-dark-50 rounded-sm hover:border-dark-400 transition-all duration-200 group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -3 }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-mono font-semibold text-white group-hover:text-accent transition-colors duration-200 flex items-center gap-2">
          {repo.name}
          {repo.fork && (
            <span className="text-[10px] px-1.5 py-0.5 bg-dark-200 text-muted rounded-sm">
              Fork
            </span>
          )}
        </h3>
        <ExternalLink className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
      </div>

      {repo.description && (
        <p className="text-sm text-muted line-clamp-2 mb-3">
          {repo.description}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-muted">
        {repo.language && (
          <div className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: langColor }}
            />
            <span>{repo.language}</span>
          </div>
        )}
        {repo.stargazers_count > 0 && (
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5" />
            <span>{formatNumber(repo.stargazers_count)}</span>
          </div>
        )}
        {repo.forks_count > 0 && (
          <div className="flex items-center gap-1">
            <GitFork className="w-3.5 h-3.5" />
            <span>{formatNumber(repo.forks_count)}</span>
          </div>
        )}
      </div>
    </motion.a>
  );
}
