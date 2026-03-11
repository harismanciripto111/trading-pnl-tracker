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
      <p
        className={`text-sm font-bold font-mono ${
          payload[0].value >= 0 ? 'text-emerald' : 'text-ruby'
        }`}
      >
        {formatCurrency(payload[0].value, currency)}
      </p>
    </div>
  );
};

export default function EquityCurve({ mini = false }) {
  const { trades } = useTradeStore();
  const { currency } = useSettingsStore();

  const data = useMemo(() => {
    if (!trades.length) return [];

    const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date));
    let cumulative = 0;
    const points = sorted.map((t) => {
      cumulative += t.pnl;
      return {
        date: t.date,
        equity: Math.round(cumulative * 100) / 100,
      };
    });

    return points;
  }, [trades]);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        No data yet
      </div>
    );
  }

  const isPositive = data[data.length - 1]?.equity >= 0;
  const color = isPositive ? '#00c48c' : '#ff4d6a';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={mini ? { top: 5, right: 5, left: 5, bottom: 5 } : { top: 10, right: 30, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {!mini && (
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        )}
        {!mini && (
          <XAxis
            dataKey="date"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
        )}
        {!mini && (
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v}`}
          />
        )}
        {!mini && <Tooltip content={<CustomTooltip currency={currency} />} />}
        <Area
          type="monotone"
          dataKey="equity"
          stroke={color}
          strokeWidth={mini ? 1.5 : 2}
          fill="url(#equityGradient)"
          dot={false}
          activeDot={mini ? false : { r: 4, fill: color, stroke: '#0a0e1a', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
