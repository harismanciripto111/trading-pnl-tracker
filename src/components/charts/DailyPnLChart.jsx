import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useTradeStore } from '../../stores/useTradeStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { formatCurrency } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111827]/95 backdrop-blur-xl border border-white/[0.08] rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p
        className={`text-sm font-bold font-mono ${
          payload[0].value >= 0 ? 'text-emerald' : 'text-ruby'
        }`}
      >
        {payload[0].value >= 0 ? '+' : ''}
        {formatCurrency(payload[0].value, currency)}
      </p>
    </div>
  );
};

export default function DailyPnLChart() {
  const { trades } = useTradeStore();
  const { currency } = useSettingsStore();

  const data = useMemo(() => {
    if (!trades.length) return [];

    // Group trades by date and sum P&L
    const dailyMap = {};
    trades.forEach((t) => {
      if (!dailyMap[t.date]) dailyMap[t.date] = 0;
      dailyMap[t.date] += t.pnl;
    });

    return Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, pnl]) => ({
        date,
        pnl: Math.round(pnl * 100) / 100,
      }));
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
      <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
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
        <Bar dataKey="pnl" radius={[4, 4, 0, 0]} maxBarSize={40}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.pnl >= 0 ? '#00c48c' : '#ff4d6a'}
              fillOpacity={0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
