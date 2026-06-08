import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { CommitStats } from '../api/profile';

interface CommitChartProps {
  data: CommitStats;
}

export function CommitChart({ data }: CommitChartProps) {
  const chartData = Object.entries(data.commits_per_week).map(([week, commits]) => ({
    week,
    commits,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-syne font-semibold text-lg">Weekly Commits</h3>
        <span className="text-sm font-mono text-muted bg-dark-100 px-2 py-1 rounded-sm">
          {data.total_commits.toLocaleString()} total
        </span>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="commitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e8ff5a" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#e8ff5a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="week"
              stroke="#666666"
              fontSize={10}
              fontFamily="JetBrains Mono"
              tickLine={false}
              axisLine={{ stroke: '#1a1a1a' }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis
              stroke="#666666"
              fontSize={10}
              fontFamily="JetBrains Mono"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: '4px',
                fontFamily: 'JetBrains Mono',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#666666' }}
              itemStyle={{ color: '#e8ff5a' }}
              labelFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString();
              }}
            />
            <Area
              type="monotone"
              dataKey="commits"
              stroke="#e8ff5a"
              strokeWidth={2}
              fill="url(#commitGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {data.most_active_day && (
        <p className="text-sm text-muted mt-3">
          Most active on{' '}
          <span className="text-white font-mono">{data.most_active_day}s</span>
        </p>
      )}
    </motion.div>
  );
}
