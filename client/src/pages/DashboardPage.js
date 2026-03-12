import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Calendar, Hash, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardPage = () => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  return (
    <div className="page-container py-12">
      <div className="content-container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {greeting}, <span className="text-primary">{user?.name}</span>
          </h1>
          <p className="text-gray-600 text-lg">Your account is secure and active.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card bg-gradient-to-br from-primary to-primary-700 text-white col-span-1 md:col-span-2 shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="h-8 w-8 text-accent" />
                  <h2 className="text-2xl font-bold">Security Status</h2>
                </div>
                <p className="text-primary-100 text-lg mb-6 leading-relaxed">
                  Your graphical password is fully configured and active. 
                  You are using a <strong className="text-white">{user?.sequenceLength}-image sequence</strong> layered with decoy protection.
                </p>
                <div className="flex gap-4">
                  <span className="badge bg-green-500/20 text-green-300 border border-green-500/30 px-4 py-2 text-sm uppercase tracking-wider backdrop-blur-sm">
                    Status: {user?.status === 'active' ? 'Active' : 'Locked'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Hash className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Account Details</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="font-semibold text-gray-900 break-all">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Cues Configured</p>
                  <p className="font-semibold text-gray-900">{user?.cueCount} anchors</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Joined</p>
                  <div className="flex items-center gap-2 text-gray-900 font-semibold">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    {new Date(user?.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Recent Security Events</h3>
            <button className="text-sm font-semibold text-primary hover:text-primary-600 flex items-center gap-1 transition-colors">
              View All <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-200">
            <ShieldCheck className="h-12 w-12 text-gray-400 mx-auto mb-3 opacity-50" />
            <p className="text-gray-500 font-medium">No recent security alerts.</p>
            <p className="text-sm text-gray-400 mt-1">Your account hasn't had any suspicious login attempts.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
