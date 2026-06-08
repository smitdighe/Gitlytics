import { motion } from 'framer-motion';
import { languageColors } from '../utils/languageColors';

interface LanguageBarProps {
  name: string;
  percentage: number;
  index?: number;
}

export function LanguageBar({ name, percentage, index = 0 }: LanguageBarProps) {
  const color = languageColors[name] || '#666666';

  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: 'easeOut' }}
    >
      <div className="flex items-center gap-2 w-28 flex-shrink-0">
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm text-muted truncate">{name}</span>
      </div>
      <div className="flex-1 h-1.5 bg-dark-100 rounded-sm overflow-hidden">
        <motion.div
          className="h-full rounded-sm"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: index * 0.05 + 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className="text-sm font-mono text-muted w-12 text-right flex-shrink-0">
        {percentage.toFixed(1)}%
      </span>
    </motion.div>
  );
}
