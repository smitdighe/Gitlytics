import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface StatRowProps {
  label: string;
  value: number | string;
  index?: number;
  formatValue?: (value: number | string) => string;
}

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = { value: 0 };
    const duration = 800;
    const startTime = performance.now();
    const targetValue = typeof value === 'number' ? value : 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      controls.value = Math.round(targetValue * eased);
      setDisplayValue(controls.value);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <>{displayValue.toLocaleString()}</>;
}

export function StatRow({ label, value, index = 0, formatValue }: StatRowProps) {
  const displayValue = formatValue
    ? formatValue(value)
    : typeof value === 'number'
    ? value.toLocaleString()
    : value;

  return (
    <motion.div
      className="flex items-center justify-between py-2.5"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: 'easeOut' }}
    >
      <span className="text-muted text-sm">{label}</span>
      <span className="font-mono font-semibold text-white">
        {typeof value === 'number' ? (
          <AnimatedNumber value={value} />
        ) : (
          displayValue
        )}
      </span>
    </motion.div>
  );
}
