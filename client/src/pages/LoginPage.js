import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { KeyRound, Loader2, ArrowRight, RefreshCw, Clock, AlertTriangle, Mail, ShieldCheck } from 'lucide-react';

const MAX_SHUFFLES = 3;
const SHUFFLE_INTERVAL_MS = 15000; // 15 seconds
const OTP_RESEND_COOLDOWN = 60; // seconds

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState(1); // 1: Email, 2: Graphical Sequence, 3: OTP
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState('');

  // Phase 2 state
  const [gridData, setGridData] = useState([]);
  const [sequenceLength, setSequenceLength] = useState(0);
  const [selectedSequence, setSelectedSequence] = useState([]);
  const [autoShuffles, setAutoShuffles] = useState(0);
  const [countdown, setCountdown] = useState(SHUFFLE_INTERVAL_MS / 1000);

  // Phase 3 OTP state
  const [otpUserId, setOtpUserId] = useState(null);
  const [otpValue, setOtpValue] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

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
    // Block submission entirely if already known-locked
    if (isLocked) return;

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email });
      setGridData(res.data.gridImages);
      setSequenceLength(res.data.sequenceLength);
      setAutoShuffles(0);
      setCountdown(SHUFFLE_INTERVAL_MS / 1000);
      setIsLocked(false);
      setLockMessage('');
      setPhase(2);
    } catch (err) {
      if (err.response?.status === 423) {
        // Account is locked — stay on Phase 1, NEVER show the image grid
        const msg =
          err.response?.data?.message ||
          'Your account has been locked due to too many failed attempts.';
        setIsLocked(true);
        setLockMessage(msg);
        // Do NOT call setPhase(2) — user stays here and cannot reach the grid
      } else {
        toast.error(err.response?.data?.message || 'Login failed. Please verify your email.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Phase 2: Image click ──────────────────────────────────────

  const handleImageClick = (imageId) => {
    // Block interaction when account is locked
    if (isLocked) return;
    // Prevent re-clicking an already selected image
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

      // ── OTP path: server responded with 202 otpPending ──────────
      if (res.data.otpPending) {
        setOtpUserId(res.data.userId);
        setOtpMessage(res.data.message);
        setOtpValue('');
        setResendCooldown(OTP_RESEND_COOLDOWN);
        setPhase(3);
        toast.success('📧 Verification code sent to your email!');
        return;
      }

      // Fallback (should not happen with current server)
      toast.success(res.data.message);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Incorrect sequence. Try again.';
      toast.error(msg);
      setSelectedSequence([]);

      if (err.response?.status === 423) {
        // Account is now locked — remove the grid entirely by going back to Phase 1
        setIsLocked(true);
        setLockMessage(msg);
        setGridData([]);          // wipe any cached grid data
        setSequenceLength(0);
        setPhase(1);              // ← back to email form; grid is unmounted
      } else {
        await fetchNewGrid(email);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Phase 3: OTP submit ────────────────────────────────────────

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otpValue.trim().length !== 6) return toast.error('Please enter the 6-digit OTP.');

    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { userId: otpUserId, otp: otpValue.trim() });
      toast.success(res.data.message);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'OTP verification failed.';
      toast.error(msg);
      if (err.response?.status === 410) {
        // OTP expired — restart from beginning
        setPhase(1);
        setOtpValue('');
        setOtpUserId(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Phase 3: Resend OTP ────────────────────────────────────────

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      // Re-submit graphical sequence to trigger a fresh OTP
      const res = await api.post('/auth/login', { email, selectedSequence });
      if (res.data.otpPending) {
        setOtpUserId(res.data.userId);
        setOtpMessage(res.data.message);
        setOtpValue('');
        setResendCooldown(OTP_RESEND_COOLDOWN);
        toast.success('📧 A new OTP has been sent to your email.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Resend-OTP cooldown ticker ─────────────────────────────────
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // ── Auto-shuffle timer ─────────────────────────────────────────
  // Uses a local `shuffleCount` variable inside the effect closure to avoid
  // stale-state reads inside setInterval callbacks.
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
  }, [phase, email]); // Re-runs if email changes (shouldn't in practice)

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
                {phase === 3
                  ? <ShieldCheck className="h-8 w-8 text-accent" />
                  : <KeyRound className="h-8 w-8 text-accent" />}
              </div>
            </div>
            <h2 className="text-3xl font-bold relative z-10">
              {phase === 3 ? 'Verify Your Identity' : 'Welcome Back'}
            </h2>
            <p className="text-primary-100 mt-2 relative z-10">
              {phase === 3
                ? 'Enter the code sent to your email.'
                : 'Log in securely using your graphical sequence.'}
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
                  {/* 🔒 Account locked banner — shown on Phase 1 when locked */}
                  {isLocked && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-300 rounded-xl px-4 py-4 flex items-start gap-3"
                    >
                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-red-700">🔒 Account Locked</p>
                        <p className="text-xs text-red-500 mt-1 leading-relaxed">
                          {lockMessage || 'Too many failed attempts. Please contact support or try again later.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => { setIsLocked(false); setLockMessage(''); setEmail(''); }}
                          className="mt-2 text-xs font-semibold text-red-600 underline hover:text-red-800"
                        >
                          Try a different account
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      className={`input-field ${
                        isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''
                      }`}
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={(e) => { if (!isLocked) setEmail(e.target.value); }}
                      readOnly={isLocked}
                    />
                  </div>
                  <button
                    type="submit"
                    className={`btn-primary w-full py-4 text-lg ${
                      isLocked ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={loading || isLocked}
                  >
                    {loading
                      ? <Loader2 className="animate-spin h-5 w-5" />
                      : isLocked
                      ? <><AlertTriangle className="h-5 w-5 mr-2 inline" />Account Locked</>
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

                  {/* Security status bar — hidden when account is locked */}
                  {!isLocked && (
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
                  )}

                  {/* Instruction + progress dots — only shown when not locked without a grid */}
                  {(!isLocked || sequenceLength > 0) && (
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
                  )}

                  {/* 🔒 Account locked banner */}
                  {isLocked && (
                    <div className="bg-red-50 border border-red-300 rounded-xl px-4 py-3 flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-red-700">Account Locked</p>
                        <p className="text-xs text-red-500 mt-0.5">{lockMessage || 'Too many failed attempts. Please contact support.'}</p>
                      </div>
                    </div>
                  )}

                  {/* 4×4 image grid */}
                  <div className={`grid grid-cols-4 gap-2 sm:gap-3 p-1 ${isLocked ? 'opacity-40 pointer-events-none select-none' : ''}`}>
                    {gridData.map((img) => {
                      const isSelected = selectedSequence.includes(img.id);
                      return (
                        <motion.div
                          key={img.id}
                          // Disable hover/tap animations for selected cells so the
                          // interaction itself doesn't reveal which images were picked.
                          // Also disable all animations when account is locked.
                          whileHover={isSelected || isLocked ? {} : { scale: 1.05 }}
                          whileTap={isSelected || isLocked ? {} : { scale: 0.95 }}
                          onClick={() => handleImageClick(img.id)}
                          className={`
                            aspect-square rounded-xl flex flex-col items-center justify-center
                            border-2 transition-all duration-300 select-none relative overflow-hidden
                            ${isSelected
                              ? 'border-gray-200 bg-gray-100 cursor-default'
                              : isLocked
                              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                              : 'border-gray-200 bg-white hover:border-secondary hover:shadow-md cursor-pointer'
                            }
                          `}
                        >
                          <AnimatePresence mode="wait" initial={false}>
                            {isSelected ? (
                              /* ── SELECTED STATE: completely blank cell ──
                                 Only a tiny neutral dot is shown. No emoji, no label,
                                 no "Selected" text — nothing for a shoulder surfer to
                                 identify which image was chosen. */
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
                                /* ── UNSELECTED STATE: show emoji + label with dynamic distortion ── */
                                <motion.div
                                  key="image"
                                  initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                                  animate={{ 
                                    opacity: 1, 
                                    scale: 0.9 + Math.random() * 0.2, // Random scale 0.9 to 1.1
                                    rotate: (Math.random() - 0.5) * 15, // Random rotation -7.5deg to 7.5deg
                                    x: (Math.random() - 0.5) * 4, // Random x shift
                                    y: (Math.random() - 0.5) * 4  // Random y shift
                                  }}
                                  exit={{ opacity: 0 }}
                                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                  className="flex flex-col items-center justify-center pointer-events-none"
                                >
                                  <span className="text-3xl drop-shadow-sm select-none">{img.emoji}</span>
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
                      onClick={() => { setIsLocked(false); setLockMessage(''); setPhase(1); }}
                      className="btn-ghost flex-1 border border-gray-200 text-gray-600 font-semibold"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSequence([]);
                        fetchNewGrid(email);
                      }}
                      disabled={isLocked}
                      className={`btn-ghost flex-1 border border-primary/20 bg-primary/5 text-primary ${
                        isLocked ? 'opacity-40 cursor-not-allowed' : ''
                      }`}
                    >
                      <RefreshCw className="w-4 h-4 mr-1 inline" /> Clear
                    </button>
                    <button
                      onClick={verifySequence}
                      className={`btn-primary flex-[2] ${
                        isLocked ? 'opacity-40 cursor-not-allowed' : ''
                      }`}
                      disabled={loading || selectedSequence.length !== sequenceLength || isLocked}
                    >
                      {loading
                        ? <Loader2 className="animate-spin h-5 w-5" />
                        : isLocked
                        ? '🔒 Account Locked'
                        : 'Login securely'
                      }
                    </button>
                  </div>

                </motion.div>
              )}
              {/* ── Phase 3: OTP Verification ── */}
              {phase === 3 && (
                <motion.form
                  key="phase3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleOtpSubmit}
                  className="space-y-6"
                >
                  {/* Info banner */}
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-4 flex items-start gap-3">
                    <Mail className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-indigo-800">Check your inbox</p>
                      <p className="text-xs text-indigo-600 mt-0.5 leading-relaxed">{otpMessage}</p>
                    </div>
                  </div>

                  {/* OTP input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                      autoFocus
                      className="input-field text-center text-2xl font-mono tracking-[0.5em] py-4"
                      placeholder="• • • • • •"
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    />
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    className="btn-primary w-full py-4 text-lg"
                    disabled={loading || otpValue.length !== 6}
                  >
                    {loading
                      ? <Loader2 className="animate-spin h-5 w-5" />
                      : <><ShieldCheck className="h-5 w-5 mr-2 inline" />Verify & Sign In</>
                    }
                  </button>

                  {/* Resend + Back */}
                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => { setPhase(1); setOtpValue(''); setSelectedSequence([]); }}
                      className="text-gray-500 hover:text-gray-700 font-medium"
                    >
                      ← Start over
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || loading}
                      className={`font-semibold ${
                        resendCooldown > 0
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-primary hover:text-primary/80'
                      }`}
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </motion.form>
              )}

            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
