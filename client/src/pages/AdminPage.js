import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, Users, Activity, Lock, Unlock, RefreshCw, Loader2, Server } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPage = () => {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, logsRes, alertsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/logs?limit=10'),
        api.get('/admin/alerts?limit=10')
      ]);
      setStats(statsRes.data);
      setLogs(logsRes.data.logs);
      setAlerts(alertsRes.data.alerts);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUnlock = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/unlock`);
      toast.success('User unlocked successfully');
      fetchData();
    } catch (err) {
      toast.error('Failed to unlock user');
    }
  };

  if (loading && !stats) return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="page-container py-12">
      <div className="content-container items-start grid lg:grid-cols-4 gap-8">
        
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-2">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin<br/><span className="text-primary">Dashboard</span></h1>
            <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5 font-medium">
              <Server className="w-4 h-4" /> System Overview
            </p>
          </div>
          
          <button 
            onClick={() => setActiveTab('stats')}
            className={`w-full text-left px-5 py-4 rounded-xl flex items-center gap-3 font-semibold transition-all ${
              activeTab === 'stats' ? 'bg-primary text-white shadow-lg' : 'bg-white hover:bg-gray-50 text-gray-700'
            }`}
          >
            <Activity className="w-5 h-5" /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={`w-full text-left px-5 py-4 rounded-xl flex items-center gap-3 font-semibold transition-all ${
              activeTab === 'logs' ? 'bg-primary text-white shadow-lg' : 'bg-white hover:bg-gray-50 text-gray-700'
            }`}
          >
            <Users className="w-5 h-5" /> Recent Logins
          </button>
          <button 
            onClick={() => setActiveTab('alerts')}
            className={`w-full text-left px-5 py-4 rounded-xl flex items-center justify-between font-semibold transition-all ${
              activeTab === 'alerts' ? 'bg-red-500 text-white shadow-lg' : 'bg-white hover:bg-red-50 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5" /> Alerts
            </div>
            {stats?.stats?.unresolvedAlerts > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'alerts' ? 'bg-white text-red-500' : 'bg-red-100 text-red-700'
              }`}>
                {stats.stats.unresolvedAlerts}
              </span>
            )}
          </button>

          <button 
            onClick={fetchData}
            className="w-full text-left px-5 py-4 mt-8 rounded-xl flex items-center justify-center gap-2 font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all border border-gray-200 border-dashed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
          </button>
        </div>

        {/* Main Content Area */}
        <div className="col-span-1 lg:col-span-3">
          <AnimatePresence mode="wait">
            
            {/* STATS TAB */}
            {activeTab === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-8"
              >
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="card border-l-4 border-l-primary flex flex-col justify-center shadow-lg">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Users className="w-4 h-4"/>Total Users</p>
                    <p className="text-4xl font-extrabold text-gray-900">{stats?.stats?.totalUsers}</p>
                  </div>
                  <div className="card border-l-4 border-l-green-500 flex flex-col justify-center shadow-lg">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Activity className="w-4 h-4"/>Success Rate</p>
                    <p className="text-4xl font-extrabold text-green-600">{stats?.stats?.successRate}%</p>
                  </div>
                  <div className="card border-l-4 border-l-yellow-500 flex flex-col justify-center shadow-lg">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Lock className="w-4 h-4"/>Locked Accounts</p>
                    <p className="text-4xl font-extrabold text-yellow-600">{stats?.stats?.lockedUsers}</p>
                  </div>
                  <div className="card border-l-4 border-l-red-500 flex flex-col justify-center shadow-lg">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><ShieldAlert className="w-4 h-4"/>Active Alerts</p>
                    <p className="text-4xl font-extrabold text-red-600">{stats?.stats?.unresolvedAlerts}</p>
                  </div>
                </div>

                <div className="card border-t-[8px] border-t-yellow-500 overflow-hidden !px-0 !py-0 shadow-lg">
                  <div className="px-6 py-5 bg-yellow-50 border-b border-yellow-100 flex items-center gap-3">
                    <Lock className="w-6 h-6 text-yellow-700" />
                    <h3 className="text-lg font-bold text-yellow-900 tracking-tight">Locked Accounts Action Required</h3>
                  </div>
                  {stats?.lockedUsers?.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {stats.lockedUsers.map(user => (
                        <div key={user.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div>
                            <p className="font-bold text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500 flex font-mono bg-gray-100 px-2 py-0.5 rounded mt-1.5 w-max">
                              {user.email}
                            </p>
                            <p className="text-xs text-yellow-600 font-semibold mt-2 uppercase tracking-wide flex items-center gap-1"><Lock className="w-3 h-3"/> Locked until {new Date(user.locked_until).toLocaleTimeString()}</p>
                          </div>
                          <button 
                            onClick={() => handleUnlock(user.id)}
                            className="btn-accent px-4 py-2 font-bold shadow-md hover:shadow-lg flex items-center gap-2"
                          >
                            <Unlock className="w-4 h-4" /> Force Unlock
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-white">
                      <Unlock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">All user accounts are active.</p>
                      <p className="text-sm text-gray-400 mt-1">No manual intervention required.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* LOGS TAB */}
            {activeTab === 'logs' && (
              <motion.div
                key="logs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="card !p-0 overflow-hidden shadow-xl border border-gray-100"
              >
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/80 backdrop-blur-sm flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" /> Attempt History
                  </h3>
                  <span className="badge-primary px-3 py-1 font-mono">{logs.length} recent</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white border-b border-gray-200 text-xs uppercase font-extrabold text-gray-500 tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Time</th>
                        <th className="px-6 py-4">Account / Email</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Phase</th>
                        <th className="px-6 py-4">IP Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-medium">
                            {new Date(log.created_at).toLocaleTimeString()}
                          </td>
                          <td className="px-6 py-4">
                            {log.user_name ? (
                              <div className="font-bold text-gray-900">{log.user_name}</div>
                            ) : (
                              <div className="text-gray-400 italic font-medium">Unknown User</div>
                            )}
                            <div className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded max-w-max mt-1">{log.email_attempted}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {log.success 
                              ? <span className="badge-success shadow-sm">Success</span> 
                              : <span className="badge-danger shadow-sm">Failed</span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-xs font-bold px-2 py-1 rounded border ${
                              log.phase === 'sequence_provided' ? 'border-primary/20 text-primary bg-primary/5' : 'border-gray-200 text-gray-500 bg-white'
                            }`}>
                              {log.phase === 'sequence_provided' ? '2: Image Grid' : '1: Email Verify'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-500">
                            {log.ip_address || 'Unknown'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {logs.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No recent logs found.</div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ALERTS TAB */}
            {activeTab === 'alerts' && (
              <motion.div
                key="alerts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-4"
              >
                {alerts.length > 0 ? alerts.map(alert => (
                  <div key={alert.id} className="card border-l-[6px] border border-gray-100 border-l-red-500 shadow-lg hover:shadow-xl transition-shadow flex items-start gap-4 p-5 bg-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl -mr-16 -mt-16 z-0" />
                    
                    <div className="p-3 bg-red-100 rounded-xl relative z-10 shrink-0">
                      <ShieldAlert className="w-8 h-8 text-red-600" />
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
                          IP: {alert.ip_address}
                        </span>
                        <span className="bg-red-50 tracking-wider text-red-700 font-bold uppercase text-[10px] px-2.5 py-1 rounded border border-red-200">
                          {alert.severity} Priority
                        </span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="card text-center p-12 py-20 bg-green-50/50 border-2 border-dashed border-green-200 shadow-none">
                    <ShieldCheck className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-green-800 tracking-tight">System is Secure</h3>
                    <p className="text-green-600 mt-2 font-medium">No security alerts generated by the access rules.</p>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
