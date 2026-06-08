import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <motion.div
      className={`bg-dark-50 animate-pulse rounded-sm ${className}`}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

export function ProfileSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="space-y-6">
        <Skeleton className="w-20 h-20 rounded-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="border-t border-dark-50 pt-6 space-y-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      </div>
      <div className="lg:col-span-2 space-y-8">
        <div className="grid grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export function CompareSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-around">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="h-8 w-32" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {[...Array(7)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
