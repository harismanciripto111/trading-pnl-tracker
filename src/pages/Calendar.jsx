import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
  parseISO,
} from 'date-fns';
import PageTransition from '../components/ui/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import PnLBadge from '../components/ui/PnLBadge';
import { useTradeStore } from '../stores/useTradeStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { formatCurrency } from '../utils/formatters';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar() {
  const { trades } = useTradeStore();
  const { currency } = useSettingsStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Build daily P&L map
  const dailyPnl = useMemo(() => {
    const map = {};
    trades.forEach((t) => {
      if (!map[t.date]) map[t.date] = { pnl: 0, trades: [] };
      map[t.date].pnl += t.pnl;
      map[t.date].trades.push(t);
    });
    // Round values
    Object.keys(map).forEach((k) => {
      map[k].pnl = Math.round(map[k].pnl * 100) / 100;
    });
    return map;
  }, [trades]);

  // Monthly stats
  const monthStats = useMemo(() => {
    const monthKey = format(currentMonth, 'yyyy-MM');
    let totalPnl = 0;
    let tradeDays = 0;
    let winDays = 0;

    Object.entries(dailyPnl).forEach(([date, data]) => {
      if (date.startsWith(monthKey)) {
        totalPnl += data.pnl;
        tradeDays++;
        if (data.pnl > 0) winDays++;
      }
    });

    return {
      totalPnl: Math.round(totalPnl * 100) / 100,
      tradeDays,
      winDays,
      winRate: tradeDays > 0 ? Math.round((winDays / tradeDays) * 100) : 0,
    };
  }, [dailyPnl, currentMonth]);

  // Calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Pad start with empty cells
    const startPadding = getDay(monthStart);
    const paddedDays = Array(startPadding).fill(null).concat(days);

    return paddedDays;
  }, [currentMonth]);

  // Selected day trades
  const selectedTrades = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return dailyPnl[dateKey]?.trades || [];
  }, [selectedDate, dailyPnl]);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Month Header */}
        <GlassCard>
          <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-400" />
              </button>
              <h2 className="text-xl font-bold text-white min-w-[200px] text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <p className="text-xs text-gray-500">Monthly P&L</p>
                <p className={`font-bold font-mono ${monthStats.totalPnl >= 0 ? 'text-emerald' : 'text-ruby'}`}>
                  {monthStats.totalPnl >= 0 ? '+' : ''}{formatCurrency(monthStats.totalPnl, currency)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Win Rate</p>
                <p className="font-bold text-gold">{monthStats.winRate}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Trade Days</p>
                <p className="font-bold text-white">{monthStats.tradeDays}</p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Calendar Grid */}
        <GlassCard>
          <div className="p-4">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-2">
              {WEEKDAYS.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const dateKey = format(day, 'yyyy-MM-dd');
                const dayData = dailyPnl[dateKey];
                const hasTrades = !!dayData;
                const pnl = dayData?.pnl || 0;
                const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === dateKey;
                const today = isToday(day);

                let bgClass = 'bg-white/[0.02] hover:bg-white/[0.05]';
                if (hasTrades) {
                  bgClass = pnl > 0
                    ? 'bg-emerald/10 hover:bg-emerald/20 border-emerald/20'
                    : pnl < 0
                    ? 'bg-ruby/10 hover:bg-ruby/20 border-ruby/20'
                    : 'bg-white/[0.05] hover:bg-white/[0.08]';
                }

                return (
                  <motion.button
                    key={dateKey}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDate(day)}
                    className={`aspect-square rounded-xl border transition-all flex flex-col items-center justify-center gap-0.5 relative ${
                      bgClass
                    } ${
                      isSelected
                        ? 'ring-2 ring-gold/50 border-gold/30'
                        : 'border-white/[0.05]'
                    }`}
                  >
                    {/* Today indicator */}
                    {today && (
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-gold" />
                    )}

                    <span className={`text-xs ${today ? 'text-gold font-bold' : 'text-gray-400'}`}>
                      {format(day, 'd')}
                    </span>

                    {hasTrades && (
                      <span
                        className={`text-[10px] font-mono font-bold ${
                          pnl > 0 ? 'text-emerald' : pnl < 0 ? 'text-ruby' : 'text-gray-400'
                        }`}
                      >
                        {pnl > 0 ? '+' : ''}
                        {Math.abs(pnl) >= 1000
                          ? `${(pnl / 1000).toFixed(1)}k`
                          : pnl.toFixed(0)}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </GlassCard>

        {/* Selected Day Detail */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <GlassCard>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">
                    Trades on {format(selectedDate, 'MMMM d, yyyy')}
                  </h3>
                  {dailyPnl[format(selectedDate, 'yyyy-MM-dd')] && (
                    <PnLBadge
                      value={dailyPnl[format(selectedDate, 'yyyy-MM-dd')].pnl}
                      currency={currency}
                      size="sm"
                    />
                  )}
                </div>

                {selectedTrades.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No trades on this day</p>
                ) : (
                  <div className="space-y-2">
                    {selectedTrades.map((trade) => (
                      <div
                        key={trade.id}
                        className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.03] border border-white/[0.05]"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                              trade.type === 'long'
                                ? 'bg-emerald/20 text-emerald'
                                : 'bg-ruby/20 text-ruby'
                            }`}
                          >
                            {trade.type?.toUpperCase()}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-white">{trade.pair}</p>
                            <p className="text-xs text-gray-500">{trade.time || '--:--'}</p>
                          </div>
                        </div>
                        <span
                          className={`font-mono font-bold text-sm ${
                            trade.pnl >= 0 ? 'text-emerald' : 'text-ruby'
                          }`}
                        >
                          {trade.pnl >= 0 ? '+' : ''}
                          {formatCurrency(trade.pnl, currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}