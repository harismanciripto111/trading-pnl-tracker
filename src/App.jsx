import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import AnimatedBackground from './components/layout/AnimatedBackground';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Trades from './pages/Trades';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

export default function App() {
  const location = useLocation();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      <AnimatedBackground />

      {/* App layout */}
      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar navigation */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex-1 flex flex-col ml-0 md:ml-20 lg:ml-64">
          <Header />

          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/trades" element={<Trades />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
