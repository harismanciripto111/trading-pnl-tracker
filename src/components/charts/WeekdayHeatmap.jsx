import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTradeStore } from '../../stores/useTradeStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { formatCurrency } from '../../utils/formatters';
import { getDay, parseISO } from 'date-fns';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function WeekdayHeatmap() {
  const { trades } = useTradeStore();
  const { currency } = useSettingsStore();

  const data = useMemo(() => {
    if (!trades.length) return [];

    const dayMap = {};
    DAYS.forEach((d, i) => {
      dayMap[i] = { day: d, totalPnl: 0, count: 0 };
    });

    trades.forEach((t) => {
      const dayIndex = getDay(parseISO(t.date));
      dayMap[dayIndex].totalPnl += t.pnl;
      dayMap[dayIndex].count += 1;
    });

    const result = Object.values(dayMap);
    const maxAbs = Math.max(...result.map((d) => Math.abs(d.totalPnl)), 1);

    return result.map((d) => ({
      ...d,
      totalPnl: Math.round(d.totalPnl * 100) / 100,
      avg: d.count > 0 ? Math.round((d.totalPnl / d.count) * 100) / 100 : 0,
      intensity: Math.abs(d.totalPnl) / maxAbs,
    }));
  }, [trades]);

  if (!trades.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        No data yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-7 gap-2 h-full items-end p-2">
      {data.map((d, i) => {
        const isPositive = d.totalPnl >= 0;
        const bgColor = d.count === 0
          ? 'bg-white/[0.03]'
          : isPositive
          ? 'bg-emerald'
          : 'bg-ruby';
        const opacity = d.count === 0 ? 1 : 0.2 + d.intensity * 0.6;

        return (
          <motion.div
            key={d.day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex flex-col items-center gap-2"
          >
            {/* Bar */}
            <div className="w-full relative flex flex-col items-center">
              <div
                className={`w-full rounded-lg ${bgColor} transition-all relative group cursor-default`}
                style={{
                  height: d.count === 0 ? '40px' : `${Math.max(40, d.intensity * 120 + 40)}px`,
                  opacity,
                }}
              >
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-[#111827]/95 backdrop-blur-xl border border-white/[0.08] rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                    <p className="text-xs font-medium text-white">{d.day}</p>
                    <p className={`text-xs font-mono ${isPositive ? 'text-emerald' : 'text-ruby'}`}>
                      {formatCurrency(d.totalPnl, currency)}
                    </p>
                    <p className="text-xs text-gray-500">{d.count} trades</p>
                  </div>
                </div>
              </div>

              {/* Value label */}
              {d.count > 0 && (
                <span
                  className={`text-xs font-mono mt-1 ${
                    isPositive ? 'text-emerald' : 'text-ruby'
                  }`}
                >
                  {d.totalPnl >= 0 ? '+' : ''}
                  {formatCurrency(d.totalPnl, currency)}
                </span>
              )}
            </div>

            {/* Day label */}
            <span className="text-xs text-gray-400 font-medium">{d.day}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
