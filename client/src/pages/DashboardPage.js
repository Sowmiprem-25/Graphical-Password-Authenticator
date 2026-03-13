import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Calendar, Hash, ArrowRight, ShieldAlert, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../services/api';

const DashboardPage = () => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    if (user?.email === 'admin@gmail.com') {
      const fetchAlerts = async () => {
        try {
          const res = await api.get('/admin/alerts?limit=3');
          setAlerts(res.data.alerts || []);
        } catch (error) {
          console.error('Failed to load recent alerts');
        }
      };
      fetchAlerts();
    }
  }, [user]);

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

        {user?.email === 'admin@gmail.com' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 card"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Recent Security Events</h3>
              <Link to="/admin" className="text-sm font-semibold text-primary hover:text-primary-600 flex items-center gap-1 transition-colors">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            {alerts.length > 0 ? (
              <div className="space-y-4">
                {alerts.map(alert => (
                  <div key={alert.id} className="card border-l-[6px] border border-gray-100 border-l-red-500 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4 p-5 bg-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl -mr-16 -mt-16 z-0" />
                    
                    <div className="p-3 bg-red-100 rounded-xl relative z-10 shrink-0">
                      <ShieldAlert className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1 relative z-10">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-extrabold text-gray-900 text-lg uppercase tracking-tight">{alert.alert_type.replace('_', ' ')}</h4>
                        <span className="text-xs font-bold text-gray-400 font-mono tracking-wider">
                          {new Date(alert.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 font-medium mb-3">{alert.message}</p>
                      
                      <div className="flex flex-wrap gap-2 text-sm mt-3 pt-3 border-t border-gray-100">
                        {alert.user_name && (
                          <span className="bg-gray-100 font-semibold px-2.5 py-1 rounded text-gray-700 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5"/> {alert.user_name}
                          </span>
                        )}
                        <span className="bg-gray-100 font-mono text-xs px-2.5 py-1 rounded text-gray-600 flex items-center gap-1">
                          IP: {alert.ip_address} {alert.location && <span className="text-[10px] font-sans font-bold text-gray-400 ml-1 block truncate max-w-[120px]" title={alert.location}>({alert.location})</span>}
                        </span>
                        <span className="bg-red-50 tracking-wider text-red-700 font-bold uppercase text-[10px] px-2.5 py-1 rounded border border-red-200">
                          {alert.severity} Priority
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-200">
                <ShieldCheck className="h-12 w-12 text-gray-400 mx-auto mb-3 opacity-50" />
                <p className="text-gray-500 font-medium">No recent security alerts.</p>
                <p className="text-sm text-gray-400 mt-1">System hasn't generated any suspicious login attempts recently.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
