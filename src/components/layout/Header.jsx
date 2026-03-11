import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { useTradeStore } from '../../stores/useTradeStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { formatPnL, getPnLColor } from '../../utils/formatters';

const pageTitles = {
  '/': 'Dashboard',
  '/calendar': 'P&L Calendar',
  '/trades': 'Trade Journal',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

export default function Header() {
  const location = useLocation();
  const { trades } = useTradeStore();
  const { currency } = useSettingsStore();

  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  // Monthly P&L for current month
  const monthlyPnL = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return trades
      .filter((t) => {
        const d = new Date(t.date);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((sum, t) => sum + t.pnl, 0);
  }, [trades]);

  // Get greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  return (
    <header className="sticky top-0 z-20 px-4 md:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Page title */}
        <div className="ml-12 md:ml-0">
          <p className="text-xs text-gray-500 mb-0.5">{greeting}</p>
          <h1 className="text-xl md:text-2xl font-bold text-gray-50 tracking-tight">
            {pageTitle}
          </h1>
        </div>

        {/* Right side - Monthly P&L badge */}
        <div className="flex items-center gap-3">
          {/* Monthly P&L Badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] backdrop-blur-xl border border-white/[0.08]">
            <span className="text-xs text-gray-400">This Month</span>
            <span className={`text-sm font-mono font-semibold ${getPnLColor(monthlyPnL)}`}>
              {formatPnL(monthlyPnL, currency)}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
