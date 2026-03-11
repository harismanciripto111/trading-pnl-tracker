import { motion } from 'framer-motion';
import PageTransition from '../components/ui/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import EquityCurve from '../components/charts/EquityCurve';
import DailyPnLChart from '../components/charts/DailyPnLChart';
import WinLossDonut from '../components/charts/WinLossDonut';
import DrawdownChart from '../components/charts/DrawdownChart';
import WeekdayHeatmap from '../components/charts/WeekdayHeatmap';
import MonthlyBarChart from '../components/charts/MonthlyBarChart';
import { useTradeStore } from '../stores/useTradeStore';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Analytics() {
  const { trades } = useTradeStore();

  if (trades.length === 0) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <p className="text-gray-400 text-lg">No trade data yet</p>
          <p className="text-gray-500 text-sm mt-2">
            Add some trades first to see your analytics
          </p>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Row 1: Equity Curve (full width) */}
        <motion.div variants={item}>
          <GlassCard>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Equity Curve</h3>
              <div className="h-[300px]">
                <EquityCurve />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Row 2: Daily P&L + Win/Loss */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div variants={item} className="lg:col-span-2">
            <GlassCard>
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Daily P&L</h3>
                <div className="h-[280px]">
                  <DailyPnLChart />
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={item}>
            <GlassCard>
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Win / Loss Ratio</h3>
                <div className="h-[280px]">
                  <WinLossDonut />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Row 3: Drawdown + Weekday Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div variants={item}>
            <GlassCard>
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Drawdown</h3>
                <div className="h-[260px]">
                  <DrawdownChart />
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={item}>
            <GlassCard>
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Profit by Day of Week</h3>
                <div className="h-[260px]">
                  <WeekdayHeatmap />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Row 4: Monthly Performance */}
        <motion.div variants={item}>
          <GlassCard>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Monthly Performance</h3>
              <div className="h-[300px]">
                <MonthlyBarChart />
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}
