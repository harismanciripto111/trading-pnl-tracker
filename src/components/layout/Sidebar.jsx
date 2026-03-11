import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarDays,
  ListOrdered,
  BarChart3,
  Settings,
  TrendingUp,
  X,
  Menu,
} from 'lucide-react';
import { useSettingsStore } from '../../stores/useSettingsStore';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/calendar', label: 'Calendar', icon: CalendarDays },
  { path: '/trades', label: 'Trades', icon: ListOrdered },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { sidebarOpen, mobileSidebarOpen, toggleMobileSidebar, closeMobileSidebar } =
    useSettingsStore();
  const location = useLocation();

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={toggleMobileSidebar}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-xl bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] text-gray-400 hover:text-gold transition-colors"
        aria-label="Toggle menu"
      >
        {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        className={`fixed top-0 left-0 z-40 h-screen flex flex-col
          bg-white/[0.03] backdrop-blur-2xl border-r border-white/[0.06]
          transition-all duration-300 ease-out
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          w-64 lg:w-64 md:w-20`}
      >
        {/* Logo area */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-white/[0.06]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center flex-shrink-0">
            <TrendingUp size={20} className="text-navy-900" />
          </div>
          <div className="md:hidden lg:block">
            <h1 className="text-sm font-bold text-gray-50 tracking-tight">P&L Tracker</h1>
            <p className="text-xs text-gray-500">Trading Journal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobileSidebar}
                className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                  ${isActive
                    ? 'text-gold bg-gold/[0.08]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
                  }`}
              >
                {/* Active indicator glow */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-gold/[0.08] border border-gold/20"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                <Icon size={20} className="relative z-10 flex-shrink-0" />
                <span className="relative z-10 text-sm font-medium md:hidden lg:block">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/[0.06]">
          <p className="text-xs text-gray-600 md:hidden lg:block">v1.0.0</p>
        </div>
      </motion.aside>
    </>
  );
}
