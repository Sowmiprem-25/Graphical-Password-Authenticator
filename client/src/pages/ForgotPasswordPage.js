import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { KeyRound, Mail, ArrowRight, Loader2, Check, Shield, Grid, RefreshCw } from 'lucide-react';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Sequence Setup, 4: Image Mapping
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  // Step 3 & 4 State (Sequence Setup)
  const [cues, setCues] = useState(['', '', '']);
  const [imageCategory, setImageCategory] = useState('mixed');
  const [imageOptions, setImageOptions] = useState({});
  const [selectedImages, setSelectedImages] = useState({});

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      toast.success(res.data.message);
      setStep(2);
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp });
      toast.success('OTP verified successfully');
      setStep(3);
    } catch (err) {
      toast.error(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = async (e) => {
    e.preventDefault();
    const cueRegex = /^[a-zA-Z0-9!@#$%^&*_+=\-?.,]{1,6}$/;
    for (const cue of cues) {
      if (!cueRegex.test(cue)) return toast.error('Format: 1-6 alphanumeric only.');
    }

    setLoading(true);
    try {
      const newImageOptions = {};
      let cumulativeIds = [];
      for (let i = 0; i < cues.length; i++) {
        const res = await api.get(`/auth/image-options?alreadySelected=${cumulativeIds.join(',')}&category=${imageCategory}`);
        newImageOptions[i] = res.data.options;
        cumulativeIds = [...cumulativeIds, ...res.data.options.map(o => o.id)];
      }
      setImageOptions(newImageOptions);
      setStep(4);
    } catch (err) {
      toast.error('Failed to load icons');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalReset = async () => {
    const sequence = cues.map((_, i) => selectedImages[i]);
    if (sequence.includes(undefined)) return toast.error('Select an icon for every cue.');

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email, otp, cues, imageSequence: sequence, imageCategory
      });
      toast.success(res.data.message);
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg py-12 px-4 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-card overflow-hidden">
          
          <div className="bg-primary px-8 py-10 text-white text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
             <Shield className="h-10 w-10 mx-auto mb-4 text-accent" />
             <h2 className="text-3xl font-bold mb-2">Password Recovery</h2>
             <p className="text-primary-100 italic">"Step ${step}: ${
               step === 1 ? 'Verify identity' : step === 2 ? 'Enter Code' : step === 3 ? 'New Cues' : 'Map Icons'
             }"</p>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.form key="s1" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} onSubmit={handleEmailSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Enter Registered Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input type="email" required className="input-field pl-10" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full py-4 uppercase font-bold tracking-widest flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : <>Send Reset Code <ArrowRight className="w-4 h-4"/></>}
                  </button>
                </motion.form>
              )}

              {step === 2 && (
                <motion.form key="s2" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} onSubmit={handleOtpVerify} className="space-y-6">
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-500">We sent a 6-digit code to <strong>{email}</strong></p>
                  </div>
                  <div>
                    <input 
                      type="text" 
                      required 
                      maxLength={6}
                      className="text-center text-4xl tracking-[0.5em] font-black border-2 border-gray-100 rounded-2xl w-full py-4 focus:border-primary outline-none" 
                      value={otp} 
                      onChange={e => setOtp(e.target.value.replace(/\D/g,''))} 
                      placeholder="000000"
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full py-4 uppercase font-bold tracking-widest">
                    {loading ? <Loader2 className="animate-spin" /> : 'Verify Code'}
                  </button>
                  <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-gray-400 font-bold hover:text-gray-600 transition-colors">Change email address?</button>
                </motion.form>
              )}

              {step === 3 && (
                <motion.form key="s3" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} onSubmit={handleStep3Submit} className="space-y-8">
                  <div className="space-y-4">
                     <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest">Setup New Memory Cues</label>
                     {cues.map((c, i) => (
                       <input key={i} type="text" required value={c} maxLength={6} className="input-field" placeholder={`Cue ${i+1}`} onChange={e => {
                         const n = [...cues]; n[i] = e.target.value; setCues(n);
                       }} />
                     ))}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-widest">New Category Theme</label>
                    <div className="grid grid-cols-4 gap-2">
                       {['mixed', 'animals', 'food', 'nature'].map(cat => (
                         <div key={cat} onClick={()=>setImageCategory(cat)} className={`cursor-pointer p-4 rounded-xl border-2 text-center transition-all ${imageCategory === cat ? 'border-primary bg-primary/5' : 'border-gray-50'}`}>
                           <span className="text-2xl block mb-1">{cat === 'mixed' ? '🎲' : cat === 'animals' ? '🦁' : cat === 'food' ? '🍕' : '🌲'}</span>
                           <span className="text-[10px] font-bold uppercase">{cat}</span>
                         </div>
                       ))}
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full py-4 uppercase font-bold tracking-widest">
                    {loading ? <Loader2 className="animate-spin" /> : 'Continue to Icon Mapping'}
                  </button>
                </motion.form>
              )}

              {step === 4 && (
                <motion.div key="s4" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-10">
                  <div className="space-y-8">
                    {cues.map((cue, idx) => (
                      <div key={idx} className={idx === 0 || selectedImages[idx-1] ? 'opacity-100' : 'opacity-30 pointer-events-none'}>
                        <div className="flex items-center gap-2 mb-4">
                          <Check className={`w-5 h-5 ${selectedImages[idx] ? 'text-green-500' : 'text-gray-200'}`} />
                          <h4 className="font-bold uppercase tracking-widest text-xs text-gray-500">Cue: <span className="text-primary">{cue}</span></h4>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {imageOptions[idx]?.map(img => (
                            <div 
                              key={img.id} 
                              onClick={() => setSelectedImages({...selectedImages, [idx]: img.id})}
                              className={`p-4 rounded-xl border-2 transition-all text-center cursor-pointer ${selectedImages[idx] === img.id ? 'border-primary bg-primary/5 shadow-inner' : 'border-gray-100 hover:bg-gray-50'}`}
                            >
                              <span className="text-3xl block mb-1">{img.emoji}</span>
                              <span className="text-[10px] uppercase font-bold text-gray-400">{img.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={handleFinalReset} disabled={loading || Object.keys(selectedImages).length !== cues.length} className="btn-primary w-full py-4 uppercase font-bold tracking-widest">
                    {loading ? <Loader2 className="animate-spin" /> : 'Confirm New Password'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
