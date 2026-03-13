import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Shield, ArrowRight, User, Mail, Grid, Check, Loader2 } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1 State
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [cues, setCues] = useState(['', '', '']); // Start with 3 cues
  const [imageCategory, setImageCategory] = useState('mixed');
  
  // Step 2 State
  const [imageOptions, setImageOptions] = useState({}); // { cueIndex: [images] }
  const [selectedImages, setSelectedImages] = useState({}); // { cueIndex: imageId }

  const handleCueChange = (index, value) => {
    const newCues = [...cues];
    newCues[index] = value;
    setCues(newCues);
  };

  const addCue = () => {
    if (cues.length < 5) setCues([...cues, '']);
  };

  const removeCue = (index) => {
    if (cues.length > 3) {
      const newCues = cues.filter((_, i) => i !== index);
      setCues(newCues);
    }
  };

  const fetchImageOptionsForCue = async (cueIndex) => {
    try {
      const alreadySelected = Object.values(selectedImages).filter(Boolean).join(',');
      const res = await api.get(`/auth/image-options?alreadySelected=${alreadySelected}`);
      setImageOptions(prev => ({ ...prev, [cueIndex]: res.data.options }));
    } catch (err) {
      toast.error(err.message || 'Failed to load image options');
    }
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return toast.error('Name and Email are required.');
    
    const cueRegex = /^[a-zA-Z0-9!@#$%^&*_+=\-?.,]{1,6}$/;
    for (const cue of cues) {
      if (!cueRegex.test(cue)) {
        return toast.error('Each cue must be 1-6 alphanumeric or special characters.');
      }
    }

    setLoading(true);
    try {
      const newImageOptions = {};
      let cumulativeOptions = [];

      for (let i = 0; i < cues.length; i++) {
        const res = await api.get(`/auth/image-options?alreadySelected=${cumulativeOptions.join(',')}&category=${imageCategory}`);
        newImageOptions[i] = res.data.options;
        const optionIds = res.data.options.map(o => o.id);
        cumulativeOptions = [...cumulativeOptions, ...optionIds];
      }
      
      setImageOptions(newImageOptions);
      setStep(2);
    } catch (err) {
      toast.error(err.message || 'Failed to load image options');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (cueIndex, imageId) => {
    setSelectedImages(prev => ({ ...prev, [cueIndex]: imageId }));
  };

  const handleFinalSubmit = async () => {
    const sequence = cues.map((_, i) => selectedImages[i]);
    if (sequence.includes(undefined)) {
      return toast.error('Please select an image for all cues.');
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        cues,
        imageSequence: sequence,
        imageCategory
      });
      
      toast.success(res.data.message);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white rounded-3xl shadow-card overflow-hidden">
          {/* Header */}
          <div className="bg-primary px-8 py-10 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="relative z-10">
              <Shield className="h-12 w-12 mx-auto mb-4 text-accent" />
              <h2 className="text-3xl font-bold mb-2">Create Secure Account</h2>
              <p className="text-primary-100">
                {step === 1 ? 'Step 1: Profile & Memory Cues' : 'Step 2: Map Images to Cues'}
              </p>
            </div>
            
            {/* Steps Indicator */}
            <div className="flex justify-center items-center gap-4 mt-8 relative z-10 w-48 mx-auto">
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white/20 -z-10" />
              <div className={`step-indicator ${step >= 1 ? 'bg-accent text-primary' : 'bg-white/20 text-white'}`}>
                1
              </div>
              <div className={`step-indicator ${step >= 2 ? 'bg-accent text-primary' : 'bg-white/20 text-white'}`}>
                2
              </div>
            </div>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleStep1Submit}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          required
                          className="input-field pl-10"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          required
                          className="input-field pl-10"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Memory Cues ({cues.length}/5)
                      </label>
                    </div>
                    
                    <div className="space-y-3">
                      {cues.map((cue, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            required
                            className="input-field"
                            value={cue}
                            onChange={(e) => handleCueChange(idx, e.target.value)}
                            maxLength={6}
                          />
                          {cues.length > 3 && (
                            <button
                              type="button"
                              onClick={() => removeCue(idx)}
                              className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {cues.length < 5 && (
                      <button
                        type="button"
                        onClick={addCue}
                        className="mt-3 text-sm text-secondary font-medium hover:text-secondary-600"
                      >
                        + Add another memory cue
                      </button>
                    )}
                  </div>

                  <div className="mt-8">
                    <label className="block text-sm font-medium text-gray-700 mb-4">Preferred Image Category</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { id: 'mixed', label: 'Mixed', icon: '🎲' },
                        { id: 'animals', label: 'Animals', icon: '🦁' },
                        { id: 'food', label: 'Food', icon: '🍕' },
                        { id: 'vehicles', label: 'Vehicles', icon: '🚗' },
                        { id: 'nature', label: 'Nature', icon: '🌲' },
                        { id: 'technology', label: 'Tech', icon: '💻' },
                        { id: 'objects', label: 'Objects', icon: '💎' },
                        { id: 'tools', label: 'Tools', icon: '🔨' }
                      ].map(cat => (
                        <div 
                          key={cat.id} 
                          onClick={() => setImageCategory(cat.id)}
                          className={`cursor-pointer rounded-xl p-3 border-2 transition-all text-center flex flex-col items-center justify-center ${imageCategory === cat.id ? 'border-primary bg-primary/5 shadow-md scale-105' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
                        >
                          <div className="text-3xl mb-1">{cat.icon}</div>
                          <div className="text-xs font-semibold text-gray-700">{cat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary w-full mt-8 py-4 text-lg"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Continue to Images'}
                    {!loading && <ArrowRight className="h-5 w-5" />}
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-10"
                >
                  <p className="text-gray-600 text-center mb-8">
                    For each memory cue below, select exactly <strong className="text-primary">one valid image</strong> to form your graphical password sequence.
                  </p>

                  <div className="space-y-12">
                    {cues.map((cue, idx) => {
                      const isComplete = !!selectedImages[idx];
                      const isActive = idx === 0 || !!selectedImages[idx - 1]; // Only unlock if previous is selected
                      
                      return (
                        <div 
                          key={idx} 
                          className={`relative transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                              ${isComplete ? 'bg-green-100 text-green-700' : 'bg-secondary text-white shadow-glow'}`}
                            >
                              {isComplete ? <Check className="h-4 w-4" /> : idx + 1}
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">
                              Cue: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-primary">{cue}</span>
                            </h3>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {imageOptions[idx] ? (
                              imageOptions[idx].map((img) => {
                                const isSelectedHere = selectedImages[idx] === img.id;
                                const isSelectedElsewhere = Object.entries(selectedImages).some(
                                  ([cIdx, iId]) => cIdx !== idx.toString() && iId === img.id
                                );
                                
                                return (
                                <div
                                  key={img.id}
                                  onClick={() => !isSelectedElsewhere && handleImageSelect(idx, img.id)}
                                  className={`image-card h-28 relative overflow-hidden flex flex-col items-center justify-center ${
                                    isSelectedHere ? 'ring-4 ring-secondary/30 bg-gray-50' : ''
                                  } ${isSelectedElsewhere ? 'opacity-30 grayscale cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}`}
                                >
                                  {isSelectedHere ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100/90 backdrop-blur-sm z-10 transition-all">
                                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white shadow-md mb-2">
                                        <Check className="h-6 w-6" />
                                      </div>
                                      <span className="text-xs font-bold text-green-700 tracking-wide uppercase">Selected</span>
                                    </div>
                                  ) : null}
                                  
                                  <span className={`text-4xl mb-2 drop-shadow-sm transition-opacity duration-300 ${isSelectedHere ? 'opacity-0' : 'opacity-100'}`}>{img.emoji}</span>
                                  <span className={`text-xs font-semibold text-gray-600 transition-opacity duration-300 ${isSelectedHere ? 'opacity-0' : 'opacity-100'}`}>{img.name}</span>
                                </div>
                              )})
                            ) : (
                              <div className="col-span-full h-28 flex items-center justify-center text-gray-400">
                                <Loader2 className="animate-spin h-6 w-6 mr-2" /> Loading options...
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-gray-100">
                    <button 
                      type="button"
                      onClick={() => setStep(1)}
                      className="btn-ghost flex-1 border border-gray-200"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleFinalSubmit}
                      className="btn-primary flex-[2]"
                      disabled={loading || Object.keys(selectedImages).length !== cues.length}
                    >
                      {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Complete Registration'}
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

export default RegisterPage;
