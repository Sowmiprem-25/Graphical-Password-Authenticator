import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-bg px-4">
      <div className="text-center max-w-lg">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            <ShieldAlert className="h-24 w-24 text-primary relative z-10" />
          </div>
        </div>
        
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4 tracking-tighter">
          404
        </h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        
        <p className="text-gray-600 mb-8 text-lg">
          The security zone you are looking for does not exist or has been moved.
        </p>
        
        <Link to="/" className="btn-primary inline-flex">
          <ArrowLeft className="h-5 w-5" />
          Return to Safety
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
