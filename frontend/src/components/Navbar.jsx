import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Car, LogOut, Shield, User } from 'lucide-react';

const Navbar = ({ onViewChange, currentView }) => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <nav className="glass sticky top-0 z-50 px-6 py-4 shadow-xl mb-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onViewChange('dashboard')}>
          <div className="bg-gradient-to-tr from-indigo-500 to-teal-400 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
            <Car className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white bg-clip-text bg-gradient-to-r from-white to-slate-300">
              Veloce<span className="text-indigo-400 font-light">Motors</span>
            </h1>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Dealership Hub</p>
          </div>
        </div>

        {/* User Info & Actions */}
        {user ? (
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 bg-slate-900/60 py-1.5 pl-3 pr-4 rounded-full border border-slate-800">
              <div className="bg-indigo-500/10 p-1.5 rounded-full border border-indigo-500/20">
                <User className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-200">{user.name}</p>
                <div className="flex items-center space-x-1">
                  {isAdmin ? (
                    <span className="inline-flex items-center text-[9px] font-bold text-teal-400 uppercase bg-teal-400/10 px-1.5 py-0.5 rounded">
                      <Shield className="w-2.5 h-2.5 mr-0.5" /> Admin
                    </span>
                  ) : (
                    <span className="text-[9px] font-medium text-indigo-400 uppercase bg-indigo-400/10 px-1.5 py-0.5 rounded">
                      Client
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center space-x-2 text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500 transition-all duration-300 px-4 py-2 rounded-full cursor-pointer"
            >
              <LogOut className="w-4.5 h-4.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onViewChange('login')}
              className={`text-xs font-semibold px-4 py-2.5 rounded-full transition-all duration-300 ${
                currentView === 'login'
                  ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => onViewChange('register')}
              className={`text-xs font-semibold px-5 py-2.5 rounded-full transition-all duration-300 ${
                currentView === 'register'
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 border border-indigo-500'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              Register
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
