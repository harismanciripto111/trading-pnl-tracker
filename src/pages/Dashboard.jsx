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
  Zap,
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

const CATEGORY_CONFIG = {
  trading: { label: 'Trading', Icon: TrendingUp, text: 'text-gold', bg: 'bg-gold/20' },
  degen: { label: 'Degen', Icon: Zap, text: 'text-purple-400', bg: 'bg-purple-400/20' },
  airdrop: { label: 'Airdrop', Icon: Gift, text: 'text-cyan-400', bg: 'bg-cyan-400/20' },
};

export default function Dashboard() {
  const { trades, getStats } = useTradeStore();
  const { currency } = useSettingsStore();
  const stats = getStats();

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
        {/* Stat Cards Row */}
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

        {/* Category Breakdown + Best/Worst Day */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* Degen P&L */}
          <motion.div variants={item}>
            <GlassCard>
              <div className="flex items-center gap-3 p-4">
                <div className="p-2.5 rounded-xl bg-purple-400/20">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Degen P&L</p>
                  <p className={`text-lg font-bold font-mono ${(stats.pnlByCategory?.degen?.pnl || 0) >= 0 ? 'text-emerald' : 'text-ruby'}`}>
                    {(stats.pnlByCategory?.degen?.pnl || 0) >= 0 ? '+' : ''}
                    {formatCurrency(stats.pnlByCategory?.degen?.pnl || 0, currency)}
                  </p>
                  <p className="text-xs text-gray-500">{stats.pnlByCategory?.degen?.count || 0} trades</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Airdrop P&L */}
          <motion.div variants={item}>
            <GlassCard>
              <div className="flex items-center gap-3 p-4">
                <div className="p-2.5 rounded-xl bg-cyan-400/20">
                  <Gift className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Airdrop Gains</p>
                  <p className={`text-lg font-bold font-mono ${(stats.pnlByCategory?.airdrop?.pnl || 0) >= 0 ? 'text-emerald' : 'text-ruby'}`}>
                    {(stats.pnlByCategory?.airdrop?.pnl || 0) >= 0 ? '+' : ''}
                    {formatCurrency(stats.pnlByCategory?.airdrop?.pnl || 0, currency)}
                  </p>
                  <p className="text-xs text-gray-500">{stats.pnlByCategory?.airdrop?.count || 0} airdrops</p>
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
                    {recentTrades.map((trade) => {
                      const cat = trade.category || 'trading';
                      const catConfig = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.trading;
                      const CatIcon = catConfig.Icon;

                      return (
                        <div
                          key={trade.id}
                          className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-medium text-white">{trade.pair}</p>
                              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${catConfig.bg} ${catConfig.text}`}>
                                <CatIcon className="w-2.5 h-2.5" />
                                {catConfig.label}
                              </span>
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
                      );
                    })}
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
