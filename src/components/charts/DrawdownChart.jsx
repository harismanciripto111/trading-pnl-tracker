import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTradeStore } from '../../stores/useTradeStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { formatCurrency } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111827]/95 backdrop-blur-xl border border-white/[0.08] rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-bold font-mono text-ruby">
        {formatCurrency(payload[0].value, currency)}
      </p>
      <p className="text-xs text-gray-500">Drawdown from peak</p>
    </div>
  );
};

export default function DrawdownChart() {
  const { trades } = useTradeStore();
  const { currency } = useSettingsStore();

  const data = useMemo(() => {
    if (!trades.length) return [];

    const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date));
    let cumulative = 0;
    let peak = 0;

    return sorted.map((t) => {
      cumulative += t.pnl;
      if (cumulative > peak) peak = cumulative;
      const drawdown = cumulative - peak;

      return {
        date: t.date,
        drawdown: Math.round(drawdown * 100) / 100,
      };
    });
  }, [trades]);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        No data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ff4d6a" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ff4d6a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip content={<CustomTooltip currency={currency} />} />
        <Area
          type="monotone"
          dataKey="drawdown"
          stroke="#ff4d6a"
          strokeWidth={2}
          fill="url(#drawdownGradient)"
          dot={false}
          activeDot={{ r: 4, fill: '#ff4d6a', stroke: '#0a0e1a', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
