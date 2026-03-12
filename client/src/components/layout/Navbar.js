import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, LogOut, User, Activity } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <Link to="/" className="text-xl font-bold text-gradient tracking-tight">
              GraPHAuth
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard" className="nav-link text-textDark hover:bg-gray-100/50">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </div>
                </Link>
                {/* Admin toggle for demo purposes */}
                <Link to="/admin" className="nav-link text-textDark hover:bg-gray-100/50">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-ghost text-red-600 hover:bg-red-50 hover:text-red-700 ml-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline font-semibold">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost border border-primary text-primary hover:bg-primary/5">
                  Login
                </Link>
                <Link to="/register" className="btn-primary py-2 px-4 rounded-lg shadow-sm">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
