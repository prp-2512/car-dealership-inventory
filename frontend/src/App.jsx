import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { RefreshCw } from 'lucide-react';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [view, setView] = useState('dashboard'); // 'dashboard', 'login', 'register'

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-slate-400 text-sm mt-4 font-medium">Initializing session...</p>
      </div>
    );
  }

  // If not logged in, force Login or Register view
  const renderMainContent = () => {
    if (!user) {
      if (view === 'register') {
        return <Register onRegisterSuccess={() => setView('dashboard')} onViewChange={setView} />;
      }
      return <Login onLoginSuccess={() => setView('dashboard')} onViewChange={setView} />;
    }

    // If logged in, show dashboard (any other view resets to dashboard)
    return <Dashboard />;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent blur-3xl pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar onViewChange={setView} currentView={view} />
        <main className="flex-grow">
          {renderMainContent()}
        </main>
        
        <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>© {new Date().getFullYear()} VeloceMotors Inc. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Contact Support</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
