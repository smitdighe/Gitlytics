import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';
import { GitBranch, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const { scrollY } = useScroll();
  const borderColor = useTransform(scrollY, [0, 50], ['rgba(26,26,26,0)', 'rgba(42,42,42,1)']);
  const backdropBlur = useTransform(scrollY, [0, 50], [0, 12]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      logout();
      toast.success('Logged out successfully');
      window.location.href = '/';
    } catch {
      toast.error('Failed to logout');
    }
  };

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        borderColor: borderColor,
        borderBottomWidth: 1,
        backdropFilter: useTransform(backdropBlur, (v) => `blur(${v}px)`),
        WebkitBackdropFilter: useTransform(backdropBlur, (v) => `blur(${v}px)`),
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <GitBranch className="w-6 h-6 text-accent" />
          <span className="font-syne font-bold text-lg tracking-tight group-hover:text-accent transition-colors duration-200">
            Gitlytics
          </span>
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img
                src={user.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`}
                alt={user.username}
                className="w-8 h-8 rounded-full border border-dark-50"
              />
              <span className="font-mono text-sm text-muted hidden sm:block">
                @{user.username}
              </span>
            </div>
            <motion.button
              onClick={handleLogout}
              className="p-2 text-muted hover:text-error transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        )}
      </div>
    </motion.nav>
  );
}
