import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useRef } from 'react';
import { GitBranch, BarChart2, Users, GitMerge } from 'lucide-react';

const heroWords = ['Any GitHub,', 'decoded.'];

const features = [
  {
    icon: BarChart2,
    title: 'Profile Analytics',
    description: 'Deep insights into any GitHub profile — stars, commits, languages, and more.',
  },
  {
    icon: Users,
    title: 'Side-by-Side Comparison',
    description: 'Compare two developers head-to-head across all key metrics.',
  },
  {
    icon: GitMerge,
    title: 'Activity Heatmap',
    description: 'Visualize contribution patterns with beautiful heatmaps and charts.',
  },
];

export default function Landing() {
  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: '-100px' });

  return (
    <div className="min-h-screen bg-dark">
      <nav className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <GitBranch className="w-6 h-6 text-accent" />
            <span className="font-syne font-bold text-lg tracking-tight group-hover:text-accent transition-colors duration-200">
              Gitlytics
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/auth"
              className="text-muted hover:text-white transition-colors duration-200 text-sm"
            >
              Sign in
            </Link>
            <Link
              to="/auth"
              className="px-4 py-2 bg-accent text-dark font-medium text-sm rounded-sm hover:bg-accent/90 transition-colors duration-200"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative">
        <section className="min-h-[80vh] flex flex-col items-center justify-center px-6">
          <motion.h1
            className="font-syne font-bold text-5xl md:text-7xl lg:text-8xl text-white text-center mb-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.15 },
              },
            }}
          >
            {heroWords.map((word) => (
              <motion.span
                key={word}
                className="inline-block mr-4 last:mr-0"
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            className="text-muted text-lg md:text-xl text-center max-w-xl mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Know any developer in 30 seconds.
          </motion.p>

          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Link
              to="/auth"
              className="px-6 py-3 bg-accent text-dark font-semibold rounded-sm hover:bg-accent/90 transition-colors duration-200"
            >
              Get started
            </Link>
            <Link
              to="/auth"
              className="px-6 py-3 border border-dark-50 text-white rounded-sm hover:border-dark-400 transition-colors duration-200"
            >
              Sign in
            </Link>
          </motion.div>
        </section>

        <section ref={featuresRef} className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="p-6 bg-dark-100 border border-dark-50 rounded-sm"
                initial={{ opacity: 0, y: 30 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  delay: index * 0.1,
                  duration: 0.5,
                  ease: 'easeOut',
                }}
              >
                <feature.icon className="w-6 h-6 text-accent mb-4" />
                <h3 className="font-syne font-semibold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-dark-50 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-muted text-sm">
            © {new Date().getFullYear()} Gitlytics. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
