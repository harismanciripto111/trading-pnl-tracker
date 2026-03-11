import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';

export const useTradeStore = create(
  persist(
    (set, get) => ({
      // ==================== STATE ====================
      trades: [],

      // ==================== ACTIONS ====================
      addTrade: (trade) =>
        set((state) => ({
          trades: [
            ...state.trades,
            {
              ...trade,
              id: crypto.randomUUID(),
              createdAt: Date.now(),
            },
          ],
        })),

      updateTrade: (id, updates) =>
        set((state) => ({
          trades: state.trades.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      removeTrade: (id) =>
        set((state) => ({
          trades: state.trades.filter((t) => t.id !== id),
        })),

      clearAllTrades: () => set({ trades: [] }),

      importTrades: (importedTrades) =>
        set({ trades: importedTrades }),

      // ==================== GETTERS ====================

      // Unified stats object (used by Dashboard)
      getStats: () => {
        const { trades } = get();
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        // Total P&L
        const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);

        // Monthly P&L
        const monthlyPnl = trades
          .filter((t) => {
            const d = parseISO(t.date);
            return d.getFullYear() === year && d.getMonth() === month;
          })
          .reduce((sum, t) => sum + t.pnl, 0);

        // Win rate
        const wins = trades.filter((t) => t.pnl > 0).length;
        const winRate = trades.length > 0 ? ((wins / trades.length) * 100).toFixed(1) : '0.0';

        // Best & Worst day
        const dailyPnL = groupByDate(trades);
        let bestDay = { date: null, pnl: 0 };
        let worstDay = { date: null, pnl: 0 };

        if (Object.keys(dailyPnL).length > 0) {
          let bestVal = -Infinity;
          let worstVal = Infinity;
          for (const [date, pnl] of Object.entries(dailyPnL)) {
            if (pnl > bestVal) { bestVal = pnl; bestDay = { date, pnl }; }
            if (pnl < worstVal) { worstVal = pnl; worstDay = { date, pnl }; }
          }
        }

        // P&L by source
        const pnlBySource = {};
        trades.forEach((t) => {
          const src = t.source || 'Unknown';
          if (!pnlBySource[src]) pnlBySource[src] = { pnl: 0, count: 0 };
          pnlBySource[src].pnl += t.pnl;
          pnlBySource[src].count++;
        });

        return {
          totalPnl,
          monthlyPnl,
          winRate,
          totalTrades: trades.length,
          bestDay,
          worstDay,
          pnlBySource,
        };
      },

      // Total P&L across all trades
      getTotalPnL: () => {
        const { trades } = get();
        return trades.reduce((sum, t) => sum + t.pnl, 0);
      },

      // Win rate percentage
      getWinRate: () => {
        const { trades } = get();
        if (trades.length === 0) return 0;
        const wins = trades.filter((t) => t.pnl > 0).length;
        return (wins / trades.length) * 100;
      },

      // Total number of trades
      getTradeCount: () => get().trades.length,

      // Best single day P&L (sum of all trades on that day)
      getBestDay: () => {
        const { trades } = get();
        if (trades.length === 0) return { date: null, pnl: 0 };
        const dailyPnL = groupByDate(trades);
        let best = { date: null, pnl: -Infinity };
        for (const [date, pnl] of Object.entries(dailyPnL)) {
          if (pnl > best.pnl) best = { date, pnl };
        }
        return best.pnl === -Infinity ? { date: null, pnl: 0 } : best;
      },

      // Worst single day P&L
      getWorstDay: () => {
        const { trades } = get();
        if (trades.length === 0) return { date: null, pnl: 0 };
        const dailyPnL = groupByDate(trades);
        let worst = { date: null, pnl: Infinity };
        for (const [date, pnl] of Object.entries(dailyPnL)) {
          if (pnl < worst.pnl) worst = { date, pnl };
        }
        return worst.pnl === Infinity ? { date: null, pnl: 0 } : worst;
      },

      // Get trades for a specific date (YYYY-MM-DD)
      getTradesByDate: (dateStr) => {
        return get().trades.filter((t) => t.date === dateStr);
      },

      // Get monthly P&L for a given year and month (0-indexed)
      getMonthlyPnL: (year, month) => {
        const { trades } = get();
        return trades
          .filter((t) => {
            const d = parseISO(t.date);
            return d.getFullYear() === year && d.getMonth() === month;
          })
          .reduce((sum, t) => sum + t.pnl, 0);
      },

      // Get daily P&L map for a given month { 'YYYY-MM-DD': totalPnL }
      getDailyPnLForMonth: (year, month) => {
        const { trades } = get();
        const monthTrades = trades.filter((t) => {
          const d = parseISO(t.date);
          return d.getFullYear() === year && d.getMonth() === month;
        });
        return groupByDate(monthTrades);
      },

      // Get equity curve data (cumulative P&L over time)
      getEquityCurve: () => {
        const { trades } = get();
        if (trades.length === 0) return [];

        const sorted = [...trades].sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );

        const dailyPnL = {};
        sorted.forEach((t) => {
          dailyPnL[t.date] = (dailyPnL[t.date] || 0) + t.pnl;
        });

        let cumulative = 0;
        return Object.entries(dailyPnL)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, pnl]) => {
            cumulative += pnl;
            return { date, pnl, cumulative };
          });
      },

      // Get P&L grouped by day of week (0=Sun, 6=Sat)
      getPnLByDayOfWeek: () => {
        const { trades } = get();
        const days = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
        const counts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

        trades.forEach((t) => {
          const dayIndex = getDay(parseISO(t.date));
          days[dayIndex] += t.pnl;
          counts[dayIndex]++;
        });

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return dayNames.map((name, i) => ({
          day: name,
          pnl: days[i],
          count: counts[i],
          avg: counts[i] > 0 ? days[i] / counts[i] : 0,
        }));
      },

      // Get recent trades (last N)
      getRecentTrades: (count = 5) => {
        const { trades } = get();
        return [...trades]
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, count);
      },

      // Get monthly P&L summary for all months with trades
      getMonthlyBreakdown: () => {
        const { trades } = get();
        const monthly = {};

        trades.forEach((t) => {
          const monthKey = t.date.substring(0, 7); // 'YYYY-MM'
          if (!monthly[monthKey]) {
            monthly[monthKey] = { month: monthKey, pnl: 0, trades: 0, wins: 0 };
          }
          monthly[monthKey].pnl += t.pnl;
          monthly[monthKey].trades++;
          if (t.pnl > 0) monthly[monthKey].wins++;
        });

        return Object.values(monthly).sort((a, b) =>
          a.month.localeCompare(b.month)
        );
      },
    }),
    {
      name: 'trading-pnl-storage',
    }
  )
);

// ==================== HELPER ====================
function groupByDate(trades) {
  const map = {};
  trades.forEach((t) => {
    map[t.date] = (map[t.date] || 0) + t.pnl;
  });
  return map;
}
