import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { useAppDispatch } from '@store/store';
import { logout } from '@store/slices/authSlice';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 font-sans relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-red-900/10 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full p-6 text-center relative z-10">
        <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          
          {/* Warning Icon */}
          <div className="mx-auto w-16 h-16 bg-red-900/20 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-500 shadow-lg shadow-red-500/5">
            <ShieldAlert className="w-9 h-9" />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Access Restricted</h1>
            <p className="text-sm text-slate-400">
              You do not have the required permissions to view this resource. Please contact your administrator if you think this is a mistake.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={handleGoBack}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 border border-slate-700/50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full py-3 px-4 bg-red-950/40 hover:bg-red-900/30 text-red-400 rounded-xl font-medium transition-all flex items-center justify-center gap-2 border border-red-900/30 hover:border-red-800/40"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out / Change Account</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
