import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { KeyRound, Loader2, ArrowRight, RefreshCw, Clock, AlertTriangle } from 'lucide-react';

const MAX_SHUFFLES = 3;
const SHUFFLE_INTERVAL_MS = 15000; // 15 seconds

// ── Helper: show a prominent lock alert then redirect to landing ──
const showLockAndRedirect = (msg, navigateFn) => {
  toast.error(
    (t) => (
      <div className="flex items-start gap-3">
        <span className="text-2xl">🔒</span>
        <div>
          <p className="font-bold text-red-700 text-sm">Account Locked</p>
          <p className="text-xs text-gray-600 mt-0.5">{msg}</p>
        </div>
      </div>
    ),
    { duration: 5000, style: { border: '1.5px solid #fca5a5', background: '#fff7f7' } }
  );
  // Small delay so the user sees the toast before redirect
  setTimeout(() => navigateFn('/'), 2000);
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState(1); // 1: Email, 2: Graphical Sequence
  const [loading, setLoading] = useState(false);

  // Phase 2 state
  const [gridData, setGridData] = useState([]);
  const [sequenceLength, setSequenceLength] = useState(0);
  const [selectedSequence, setSelectedSequence] = useState([]);
  const [autoShuffles, setAutoShuffles] = useState(0);
  const [countdown, setCountdown] = useState(SHUFFLE_INTERVAL_MS / 1000);

  // ── Helpers ───────────────────────────────────────────────────

  const fetchNewGrid = async (currentEmail) => {
    try {
      const res = await api.post('/auth/login', { email: currentEmail });
      setGridData(res.data.gridImages);
    } catch (e) {
      // silently ignore — grid stays as-is
    }
  };

  // ── Phase 1: Email submit ─────────────────────────────────────

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Email is required');

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email });
      setGridData(res.data.gridImages);
      setSequenceLength(res.data.sequenceLength);
      setAutoShuffles(0);
      setCountdown(SHUFFLE_INTERVAL_MS / 1000);
      setPhase(2);
    } catch (err) {
      if (err.response?.status === 423) {
        // Account is locked — alert and redirect to landing page
        const msg =
          err.response?.data?.message ||
          'Your account has been locked due to too many failed attempts.';
        showLockAndRedirect(msg, navigate);
      } else {
        toast.error(err.response?.data?.message || 'Login failed. Please verify your email.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Phase 2: Image click ──────────────────────────────────────

  const handleImageClick = (imageId) => {
    if (selectedSequence.includes(imageId)) return;
    if (selectedSequence.length >= sequenceLength) return;
    setSelectedSequence((prev) => [...prev, imageId]);
  };

  // ── Phase 2: Verify sequence ──────────────────────────────────

  const verifySequence = async () => {
    if (selectedSequence.length !== sequenceLength) {
      return toast.error(`Please select exactly ${sequenceLength} images.`);
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, selectedSequence });
      toast.success(res.data.message);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || 'Incorrect sequence. Try again.';

      if (err.response?.status === 423) {
        // Account just got locked — alert and redirect to landing page
        showLockAndRedirect(msg, navigate);
      } else {
        toast.error(msg);
        setSelectedSequence([]);
        // Re-fetch a freshly shuffled grid on failed attempt
        await fetchNewGrid(email);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Auto-shuffle timer ────────────────────────────────────────
  useEffect(() => {
    if (phase !== 2) return;

    let shuffleCount = 0;

    // 1-second countdown display
    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return SHUFFLE_INTERVAL_MS / 1000;
        return prev - 1;
      });
    }, 1000);

    // Main shuffle interval (fires every SHUFFLE_INTERVAL_MS)
    const shuffleTimer = setInterval(async () => {
      shuffleCount += 1;

      if (shuffleCount > MAX_SHUFFLES) {
        // Session expired — force back to email phase
        toast.error('Session expired due to inactivity. Please restart login.', {
          duration: 5000,
          icon: '🔒',
        });
        setPhase(1);
        setSelectedSequence([]);
        setAutoShuffles(0);
      } else {
        // Shuffle the grid
        toast(`Grid auto-shuffled for security (${shuffleCount}/${MAX_SHUFFLES})`, {
          icon: '🔄',
          duration: 2500,
        });
        setAutoShuffles(shuffleCount);
        setSelectedSequence([]);
        setCountdown(SHUFFLE_INTERVAL_MS / 1000);

        try {
          const res = await api.post('/auth/login', { email });
          setGridData(res.data.gridImages);
        } catch (e) {
          // ignore — grid stays as-is
        }
      }
    }, SHUFFLE_INTERVAL_MS);

    return () => {
      clearInterval(countdownTimer);
      clearInterval(shuffleTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, email]);

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-bg py-12 px-4 sm:px-6 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-3xl shadow-card overflow-hidden">

          {/* Header */}
          <div className="bg-primary px-8 py-10 text-white text-center relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
            <div className="flex justify-center mb-4 relative z-10">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                <KeyRound className="h-8 w-8 text-accent" />
              </div>
            </div>
            <h2 className="text-3xl font-bold relative z-10">Welcome Back</h2>
            <p className="text-primary-100 mt-2 relative z-10">
              Log in securely using your graphical sequence.
            </p>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">

              {/* ── Phase 1: Email input ── */}
              {phase === 1 && (
                <motion.form
                  key="phase1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleEmailSubmit}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      className="input-field"
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-primary w-full py-4 text-lg"
                    disabled={loading}
                  >
                    {loading
                      ? <Loader2 className="animate-spin h-5 w-5" />
                      : <>Continue to Password Grid <ArrowRight className="h-5 w-5 ml-2 inline" /></>
                    }
                  </button>
                  <div className="text-center">
                    <Link to="/forgot-password" size="sm" className="text-sm font-semibold text-gray-400 hover:text-primary transition-colors">
                      Forgot your graphical sequence?
                    </Link>
                  </div>
                </motion.form>
              )}

              {/* ── Phase 2: Image grid ── */}
              {phase === 2 && (
                <motion.div
                  key="phase2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >

                  {/* Security status bar */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-700">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-semibold">
                        Grid reshuffles in <span className="font-mono text-amber-900">{countdown}s</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {Array(MAX_SHUFFLES).fill(0).map((_, i) => (
                        <div
                          key={i}
                          title={i < autoShuffles ? 'Shuffled' : 'Remaining'}
                          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                            i < autoShuffles ? 'bg-red-400' : 'bg-amber-200'
                          }`}
                        />
                      ))}
                      <span className="text-[11px] text-amber-600 font-medium ml-1">
                        {autoShuffles >= MAX_SHUFFLES
                          ? <span className="text-red-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Last shuffle</span>
                          : `${MAX_SHUFFLES - autoShuffles} left`
                        }
                      </span>
                    </div>
                  </div>

                  {/* Instruction + progress dots */}
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Graphical Authentication</h3>
                    <p className="text-sm text-gray-500">
                      Click your mapped images in order —{' '}
                      <strong className="text-primary">{selectedSequence.length}/{sequenceLength}</strong> selected.
                    </p>
                    <div className="flex justify-center gap-2 mt-3">
                      {Array(sequenceLength).fill(0).map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            i < selectedSequence.length
                              ? 'bg-secondary ring-4 ring-secondary/20 shadow-glow'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* 4×4 image grid */}
                  <div className="grid grid-cols-4 gap-2 sm:gap-3 p-1">
                    {gridData.map((img) => {
                      const isSelected = selectedSequence.includes(img.id);
                      return (
                        <motion.div
                          key={img.id}
                          whileHover={isSelected ? {} : { scale: 1.05 }}
                          whileTap={isSelected ? {} : { scale: 0.95 }}
                          onClick={() => handleImageClick(img.id)}
                          className={`
                            aspect-square rounded-xl flex flex-col items-center justify-center
                            border-2 transition-all duration-300 select-none relative overflow-hidden
                            ${isSelected
                              ? 'border-gray-200 bg-gray-100 cursor-default'
                              : 'border-gray-200 bg-white hover:border-secondary hover:shadow-md cursor-pointer'
                            }
                          `}
                        >
                          <AnimatePresence mode="wait" initial={false}>
                            {isSelected ? (
                              <motion.div
                                key="blank"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center justify-center w-full h-full"
                              >
                                <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="image"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col items-center justify-center"
                              >
                                <span className="text-3xl drop-shadow-sm">{img.emoji}</span>
                                <span className="text-[10px] font-semibold text-gray-500 mt-1 uppercase tracking-wider hidden sm:block">
                                  {img.name}
                                </span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setPhase(1)}
                      className="btn-ghost flex-1 border border-gray-200 text-gray-600 font-semibold"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSequence([]);
                        fetchNewGrid(email);
                      }}
                      className="btn-ghost flex-1 border border-primary/20 bg-primary/5 text-primary"
                    >
                      <RefreshCw className="w-4 h-4 mr-1 inline" /> Clear
                    </button>
                    <button
                      onClick={verifySequence}
                      className="btn-primary flex-[2]"
                      disabled={loading || selectedSequence.length !== sequenceLength}
                    >
                      {loading
                        ? <Loader2 className="animate-spin h-5 w-5" />
                        : 'Login securely'
                      }
                    </button>
                  </div>

                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
