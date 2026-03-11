import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Award,
  AlertTriangle,
  ArrowRight,
  Flame,
  Gift,
} from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import StatCard from '../components/ui/StatCard';
import GlassCard from '../components/ui/GlassCard';
import PnLBadge from '../components/ui/PnLBadge';
import EquityCurve from '../components/charts/EquityCurve';
import { useTradeStore } from '../stores/useTradeStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { formatCurrency, formatDate } from '../utils/formatters';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { trades, getStats } = useTradeStore();
  const { currency } = useSettingsStore();
  const stats = getStats();

  const degenStats = stats.pnlByCategory?.degen || { pnl: 0, count: 0 };
  const airdropStats = stats.pnlByCategory?.airdrop || { pnl: 0, count: 0 };

  const recentTrades = useMemo(() => {
    return [...trades]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  }, [trades]);

  return (
    <PageTransition>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Main Stat Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={item}>
            <StatCard
              title="Total P&L"
              value={`${stats.totalPnl >= 0 ? '+' : ''}${formatCurrency(stats.totalPnl, currency)}`}
              icon={stats.totalPnl >= 0 ? TrendingUp : TrendingDown}
              colorClass={stats.totalPnl >= 0 ? 'text-emerald' : 'text-ruby'}
            />
          </motion.div>

          <motion.div variants={item}>
            <StatCard
              title="Monthly P&L"
              value={`${stats.monthlyPnl >= 0 ? '+' : ''}${formatCurrency(stats.monthlyPnl, currency)}`}
              icon={BarChart3}
              colorClass={stats.monthlyPnl >= 0 ? 'text-emerald' : 'text-ruby'}
            />
          </motion.div>

          <motion.div variants={item}>
            <StatCard
              title="Win Rate"
              value={`${stats.winRate}%`}
              icon={Target}
              colorClass="text-gold"
            />
          </motion.div>

          <motion.div variants={item}>
            <StatCard
              title="Total Trades"
              value={stats.totalTrades.toString()}
              icon={BarChart3}
              colorClass="text-blue-400"
            />
          </motion.div>
        </div>

        {/* Degen & Airdrop + Best/Worst Day */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Degen P&L */}
          <motion.div variants={item}>
            <GlassCard>
              <div className="flex items-center gap-3 p-4">
                <div className="p-2.5 rounded-xl bg-purple-500/20">
                  <Flame className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Degen P&L</p>
                  <p className={`text-lg font-bold font-mono ${degenStats.pnl >= 0 ? 'text-emerald' : 'text-ruby'}`}>
                    {degenStats.pnl >= 0 ? '+' : ''}{formatCurrency(degenStats.pnl, currency)}
                  </p>
                  <p className="text-xs text-gray-500">{degenStats.count} degen trade{degenStats.count !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Airdrop Gains */}
          <motion.div variants={item}>
            <GlassCard>
              <div className="flex items-center gap-3 p-4">
                <div className="p-2.5 rounded-xl bg-cyan-500/20">
                  <Gift className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Airdrop Gains</p>
                  <p className={`text-lg font-bold font-mono ${airdropStats.pnl >= 0 ? 'text-emerald' : 'text-ruby'}`}>
                    {airdropStats.pnl >= 0 ? '+' : ''}{formatCurrency(airdropStats.pnl, currency)}
                  </p>
                  <p className="text-xs text-gray-500">{airdropStats.count} airdrop{airdropStats.count !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Best Day */}
          <motion.div variants={item}>
            <GlassCard>
              <div className="flex items-center gap-3 p-4">
                <div className="p-2.5 rounded-xl bg-emerald/20">
                  <Award className="w-5 h-5 text-emerald" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Best Day</p>
                  <p className="text-lg font-bold text-emerald font-mono">
                    +{formatCurrency(stats.bestDay?.pnl || 0, currency)}
                  </p>
                  <p className="text-xs text-gray-500">{stats.bestDay?.date ? formatDate(stats.bestDay.date) : 'N/A'}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Worst Day */}
          <motion.div variants={item}>
            <GlassCard>
              <div className="flex items-center gap-3 p-4">
                <div className="p-2.5 rounded-xl bg-ruby/20">
                  <AlertTriangle className="w-5 h-5 text-ruby" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Worst Day</p>
                  <p className="text-lg font-bold text-ruby font-mono">
                    {formatCurrency(stats.worstDay?.pnl || 0, currency)}
                  </p>
                  <p className="text-xs text-gray-500">{stats.worstDay?.date ? formatDate(stats.worstDay.date) : 'N/A'}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Equity Curve + Recent Trades */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Equity Curve */}
          <motion.div variants={item} className="lg:col-span-2">
            <GlassCard>
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Equity Curve (Last 30 Days)</h3>
                <div className="h-[250px]">
                  <EquityCurve />
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Recent Trades */}
          <motion.div variants={item}>
            <GlassCard>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-400">Recent Trades</h3>
                  <Link
                    to="/trades"
                    className="text-xs text-gold hover:text-gold/80 flex items-center gap-1 transition-colors"
                  >
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {recentTrades.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">No trades yet</p>
                ) : (
                  <div className="space-y-2">
                    {recentTrades.map((trade) => (
                      <div
                        key={trade.id}
                        className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-white">{trade.pair}</p>
                            {trade.category && trade.category !== 'trading' && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                trade.category === 'degen'
                                  ? 'bg-purple-500/20 text-purple-400'
                                  : 'bg-cyan-500/20 text-cyan-400'
                              }`}>
                                {trade.category.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {formatDate(trade.date)}
                            {trade.source && (
                              <span className="ml-1.5 px-1.5 py-0.5 rounded bg-white/[0.08] text-gray-400 text-[10px]">
                                {trade.source}
                              </span>
                            )}
                          </p>
                        </div>
                        <PnLBadge value={trade.pnl} currency={currency} size="xs" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </motion.div>
    </PageTransition>
  );
}
