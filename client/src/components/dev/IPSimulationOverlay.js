import React, { useState, useEffect } from 'react';
import { Globe, X, Check, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const IPSimulationOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [ip, setIp] = useState('');
  const [activeIp, setActiveIp] = useState(localStorage.getItem('gpa_simulated_ip') || '');

  const simulatedIps = [
    { label: 'London, UK', ip: '81.2.69.142' },
    { label: 'New York, US', ip: '161.185.160.93' },
    { label: 'Tokyo, JP', ip: '1.33.0.0' },
    { label: 'Mumbai, IN', ip: '103.21.159.0' },
  ];

  const handleApply = (newIp) => {
    if (newIp) {
      localStorage.setItem('gpa_simulated_ip', newIp);
      setActiveIp(newIp);
    } else {
      localStorage.removeItem('gpa_simulated_ip');
      setActiveIp('');
    }
    window.location.reload(); // Reload to ensure interceptor picks it up
  };

  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            <div className="bg-primary p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                <span className="font-bold text-sm">IP Simulator</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Custom IP Address</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    placeholder="e.g. 8.8.8.8"
                    className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                  <button 
                    onClick={() => handleApply(ip)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Quick Select</label>
                <div className="grid grid-cols-1 gap-2">
                  {simulatedIps.map((item) => (
                    <button
                      key={item.ip}
                      onClick={() => handleApply(item.ip)}
                      className={`text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between ${
                        activeIp === item.ip 
                          ? 'bg-primary/10 text-primary border border-primary/20' 
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] opacity-60 ml-2">{item.ip}</span>
                    </button>
                  ))}
                </div>
              </div>

              {activeIp && (
                <div className="pt-2 border-t border-gray-100">
                  <button 
                    onClick={() => handleApply('')}
                    className="w-full py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
                  >
                    <ShieldAlert className="w-3 h-3" /> Reset to Local IP
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ${
          activeIp ? 'bg-orange-500 text-white animate-pulse' : 'bg-white text-primary border border-gray-200'
        }`}
      >
        <Globe className="w-6 h-6" />
        {activeIp && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full" />}
      </motion.button>
    </div>
  );
};

export default IPSimulationOverlay;
