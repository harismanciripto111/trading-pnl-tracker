import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTradeStore } from '../../stores/useTradeStore';

const COLORS = ['#00c48c', '#ff4d6a'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111827]/95 backdrop-blur-xl border border-white/[0.08] rounded-xl px-4 py-3 shadow-xl">
      <p className="text-sm font-medium text-white">{payload[0].name}</p>
      <p className="text-xs text-gray-400">{payload[0].value} trades ({payload[0].payload.pct}%)</p>
    </div>
  );
};

export default function WinLossDonut() {
  const { trades } = useTradeStore();

  const data = useMemo(() => {
    if (!trades.length) return { chart: [], winRate: 0 };

    const wins = trades.filter((t) => t.pnl > 0).length;
    const losses = trades.filter((t) => t.pnl <= 0).length;
    const total = trades.length;
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

    return {
      chart: [
        { name: 'Wins', value: wins, pct: winRate },
        { name: 'Losses', value: losses, pct: 100 - winRate },
      ],
      winRate,
    };
  }, [trades]);

  if (!trades.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        No data yet
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data.chart}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="80%"
            paddingAngle={4}
            dataKey="value"
            stroke="none"
          >
            {data.chart.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} fillOpacity={0.85} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-bold text-white">{data.winRate}%</span>
        <span className="text-xs text-gray-400">Win Rate</span>
      </div>
    </div>
  );
}
