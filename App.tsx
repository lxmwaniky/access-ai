import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';

// Lazy load the Demo page (only loads when user clicks "Try Demo")
const Demo = lazy(() => import('./Demo'));

// Loading fallback component
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center">
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-2xl mb-4 animate-pulse">
        <span className="text-4xl">🤰</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Loading Access.ai...</h2>
      <p className="text-slate-400">Preparing your AI assistant</p>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/demo" element={<Demo />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
