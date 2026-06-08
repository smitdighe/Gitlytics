import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GitBranch, Eye, EyeOff, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { authApi, RegisterData, LoginData } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

type AuthMode = 'login' | 'register';

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  general?: string;
}

const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  const { login, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    document.title = `${mode === 'login' ? 'Sign In' : 'Sign Up'} — Gitlytics`;
  }, [mode]);

  const validateField = useCallback((field: string, value: string) => {
    switch (field) {
      case 'username':
        if (!value) return 'Username is required';
        if (!usernameRegex.test(value)) {
          return '3-30 chars, alphanumeric and underscore only';
        }
        return undefined;
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Invalid email address';
        }
        return undefined;
      case 'password':
        if (!value) return 'Password is required';
        if (mode === 'register' && !passwordRegex.test(value)) {
          return 'Min 8 chars, upper, lower, digit, and special char';
        }
        return undefined;
      default:
        return undefined;
    }
  }, [mode]);

  useEffect(() => {
    if (mode === 'register' && username) {
      setErrors(prev => ({
        ...prev,
        username: validateField('username', username),
      }));
    }
    if (email) {
      setErrors(prev => ({
        ...prev,
        email: validateField('email', email),
      }));
    }
    if (password) {
      setErrors(prev => ({
        ...prev,
        password: validateField('password', password),
      }));
    }
  }, [username, email, password, mode, validateField]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setShake(false);

    const newErrors: FormErrors = {};

    if (mode === 'register') {
      newErrors.username = validateField('username', username);
    }
    newErrors.email = validateField('email', email);
    newErrors.password = validateField('password', password);

    if (Object.values(newErrors).some(Boolean)) {
      setErrors(newErrors);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setIsSubmitting(true);

    try {
      let response;
      if (mode === 'register') {
        const data: RegisterData = { username, email, password };
        response = await authApi.register(data);
      } else {
        const data: LoginData = { email, password };
        response = await authApi.login(data);
      }

      login(response.user, response.access_token);
      toast.success(`Welcome${response.user.username ? `, ${response.user.username}` : ''}!`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const error = err as { response?: { status?: number; data?: { detail?: string; message?: string } } };
      const status = error.response?.status;
      const message = error.response?.data?.detail || error.response?.data?.message;

      if (status === 409) {
        setErrors({ email: 'Email already registered' });
      } else if (status === 401) {
        setErrors({ general: 'Invalid credentials' });
      } else if (status === 400 && message?.includes('username')) {
        setErrors({ username: message });
      } else {
        setErrors({ general: message || 'Something went wrong' });
      }
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4 py-8">
      <motion.div
        className="w-full max-w-[400px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="bg-dark-100 border border-dark-50 rounded-sm p-8">
          <div className="flex justify-center mb-6">
            <Link to="/" className="flex items-center gap-2">
              <GitBranch className="w-6 h-6 text-accent" />
              <span className="font-syne font-bold text-lg tracking-tight">
                Gitlytics
              </span>
            </Link>
          </div>

          <div className="flex relative mb-8 bg-dark rounded-sm p-1">
            <motion.div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-dark-100 border border-dark-50 rounded-sm"
              animate={{ left: mode === 'login' ? '4px' : 'calc(50%)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
            <button
              className={`relative z-10 flex-1 py-2 text-sm font-medium transition-colors duration-200 ${
                mode === 'login' ? 'text-white' : 'text-muted'
              }`}
              onClick={() => setMode('login')}
            >
              Login
            </button>
            <button
              className={`relative z-10 flex-1 py-2 text-sm font-medium transition-colors duration-200 ${
                mode === 'register' ? 'text-white' : 'text-muted'
              }`}
              onClick={() => setMode('register')}
            >
              Register
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: mode === 'login' ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'login' ? 30 : -30 }}
              transition={{ duration: 0.35 }}
              className={`space-y-5 ${shake ? 'animate-shake' : ''}`}
            >
              {mode === 'register' && (
                <div>
                  <label className="block text-sm text-muted mb-2">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={`w-full bg-dark border ${
                        errors.username ? 'border-error' : 'border-dark-50 focus:border-dark-400'
                      } rounded-sm py-2.5 pl-10 pr-4 text-white text-sm font-mono focus:outline-none transition-colors duration-200`}
                      placeholder="username"
                    />
                  </div>
                  {errors.username && (
                    <motion.p
                      className="text-error text-xs mt-1.5 flex items-center gap-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <AlertCircle className="w-3 h-3" />
                      {errors.username}
                    </motion.p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm text-muted mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full bg-dark border ${
                      errors.email ? 'border-error' : 'border-dark-50 focus:border-dark-400'
                    } rounded-sm py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none transition-colors duration-200`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <motion.p
                    className="text-error text-xs mt-1.5 flex items-center gap-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-sm text-muted mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full bg-dark border ${
                      errors.password ? 'border-error' : 'border-dark-50 focus:border-dark-400'
                    } rounded-sm py-2.5 pl-10 pr-11 text-white text-sm focus:outline-none transition-colors duration-200`}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    className="text-error text-xs mt-1.5 flex items-center gap-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <AlertCircle className="w-3 h-3" />
                    {errors.password}
                  </motion.p>
                )}
              </div>

              {errors.general && (
                <motion.p
                  className="text-error text-sm text-center bg-error/10 py-2 rounded-sm flex items-center justify-center gap-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.general}
                </motion.p>
              )}

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-accent text-dark font-semibold rounded-sm hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
              >
                {isSubmitting ? (
                  <motion.span
                    className="inline-block"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                  </motion.span>
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </motion.button>
            </motion.form>
          </AnimatePresence>
        </div>
      </motion.div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          50% { transform: translateX(8px); }
          75% { transform: translateX(-8px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
