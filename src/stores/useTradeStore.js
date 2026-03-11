import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

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
              pnl: parseFloat(trade.pnl) || 0,
              entryPrice: trade.entryPrice ? parseFloat(trade.entryPrice) : null,
              exitPrice: trade.exitPrice ? parseFloat(trade.exitPrice) : null,
              id: generateId(),
              createdAt: Date.now(),
            },
          ],
        })),

      updateTrade: (id, updates) =>
        set((state) => ({
          trades: state.trades.map((t) =>
            t.id === id ? {
              ...t,
              ...updates,
              ...(updates.pnl !== undefined ? { pnl: parseFloat(updates.pnl) || 0 } : {}),
              ...(updates.entryPrice !== undefined ? { entryPrice: updates.entryPrice ? parseFloat(updates.entryPrice) : null } : {}),
              ...(updates.exitPrice !== undefined ? { exitPrice: updates.exitPrice ? parseFloat(updates.exitPrice) : null } : {}),
            } : t
          ),
        })),

      removeTrade: (id) =>
        set((state) => ({
          trades: state.trades.filter((t) => t.id !== id),
        })),

      clearAllTrades: () => set({ trades: [] }),

      importTrades: (importedTrades) =>
        set({
          trades: importedTrades.map((t) => ({
            ...t,
            pnl: parseFloat(t.pnl) || 0,
            entryPrice: t.entryPrice ? parseFloat(t.entryPrice) : null,
            exitPrice: t.exitPrice ? parseFloat(t.exitPrice) : null,
            category: t.category || 'trading',
          })),
        }),

      // ==================== GETTERS ====================

      // Unified stats object (used by Dashboard)
      getStats: () => {
        const { trades } = get();
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        // Total P&L (all categories)
        const totalPnl = trades.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0);

        // Monthly P&L
        const monthlyPnl = trades
          .filter((t) => {
            const d = parseISO(t.date);
            return d.getFullYear() === year && d.getMonth() === month;
          })
          .reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0);

        // Win/loss count
        const wins = trades.filter((t) => t.pnl > 0).length;
        const losses = trades.filter((t) => t.pnl < 0).length;
        const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;

        // Best/worst trade
        const bestTrade = trades.length > 0
          ? trades.reduce((best, t) => (t.pnl > best.pnl ? t : best), trades[0])
          : null;
        const worstTrade = trades.length > 0
          ? trades.reduce((worst, t) => (t.pnl < worst.pnl ? t : worst), trades[0])
          : null;

        // P&L by source
        const pnlBySource = {};
        trades.forEach((t) => {
          const src = t.source || 'Unknown';
          if (!pnlBySource[src]) pnlBySource[src] = { pnl: 0, count: 0 };
          pnlBySource[src].pnl += (parseFloat(t.pnl) || 0);
          pnlBySource[src].count += 1;
        });

        // P&L by category (trading, degen, airdrop)
        const pnlByCategory = {};
        trades.forEach((t) => {
          const cat = t.category || 'trading';
          if (!pnlByCategory[cat]) pnlByCategory[cat] = { pnl: 0, count: 0 };
          pnlByCategory[cat].pnl += (parseFloat(t.pnl) || 0);
          pnlByCategory[cat].count += 1;
        });

        // Daily P&L map
        const dailyPnL = groupByDate(trades);

        // Streak
        const sortedDays = Object.keys(dailyPnL).sort();
        let currentStreak = 0;
        for (let i = sortedDays.length - 1; i >= 0; i--) {
          const pnl = dailyPnL[sortedDays[i]];
          if (i === sortedDays.length - 1) {
            currentStreak = pnl >= 0 ? 1 : -1;
          } else {
            if ((currentStreak > 0 && pnl >= 0) || (currentStreak < 0 && pnl < 0)) {
              currentStreak += currentStreak > 0 ? 1 : -1;
            } else {
              break;
            }
          }
        }

        return {
          totalPnl,
          monthlyPnl,
          totalTrades: trades.length,
          wins,
          losses,
          winRate,
          bestTrade,
          worstTrade,
          pnlBySource,
          pnlByCategory,
          dailyPnL,
          currentStreak,
        };
      },

      // Individual getter for backward compatibility
      getTotalPnL: () => {
        const { trades } = get();
        return trades.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0);
      },

      getTradesByMonth: (year, month) => {
        const { trades } = get();
        return trades.filter((t) => {
          const d = parseISO(t.date);
          return d.getFullYear() === year && d.getMonth() === month;
        });
      },

      getCalendarData: (year, month) => {
        const { trades } = get();
        const start = startOfMonth(new Date(year, month));
        const end = endOfMonth(start);
        const days = eachDayOfInterval({ start, end });

        const dailyMap = {};
        trades.forEach((t) => {
          const key = t.date;
          if (!dailyMap[key]) dailyMap[key] = { pnl: 0, count: 0 };
          dailyMap[key].pnl += (parseFloat(t.pnl) || 0);
          dailyMap[key].count += 1;
        });

        return days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          return {
            date: key,
            dayOfMonth: day.getDate(),
            dayOfWeek: getDay(day),
            ...(dailyMap[key] || { pnl: 0, count: 0 }),
          };
        });
      },

      getMonthlyPnL: (year) => {
        const { trades } = get();
        return Array.from({ length: 12 }, (_, i) => {
          const monthTrades = trades.filter((t) => {
            const d = parseISO(t.date);
            return d.getFullYear() === year && d.getMonth() === i;
          });
          return {
            month: format(new Date(year, i), 'MMM'),
            pnl: monthTrades.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0),
            count: monthTrades.length,
          };
        });
      },

      getEquityCurve: () => {
        const { trades } = get();
        const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date));
        const dailyPnL = {};
        sorted.forEach((t) => {
          dailyPnL[t.date] = (dailyPnL[t.date] || 0) + (parseFloat(t.pnl) || 0);
        });

        let cumulative = 0;
        return Object.keys(dailyPnL)
          .sort()
          .map((date) => {
            cumulative += dailyPnL[date];
            return { date, equity: cumulative };
          });
      },

      getPnLByDayOfWeek: () => {
        const { trades } = get();
        const days = [0, 0, 0, 0, 0, 0, 0];
        trades.forEach((t) => {
          const dayIndex = getDay(parseISO(t.date));
          days[dayIndex] += (parseFloat(t.pnl) || 0);
        });
        const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return labels.map((label, i) => ({ day: label, pnl: days[i] }));
      },

      getTradesByCategory: (category) => {
        const { trades } = get();
        if (category === 'trading') {
          return trades.filter((t) => !t.category || t.category === 'trading');
        }
        return trades.filter((t) => t.category === category);
      },

      getMonthlyBreakdown: () => {
        const { trades } = get();
        const monthly = {};
        trades.forEach((t) => {
          const monthKey = t.date.substring(0, 7);
          if (!monthly[monthKey]) monthly[monthKey] = { pnl: 0, count: 0, wins: 0, losses: 0 };
          monthly[monthKey].pnl += (parseFloat(t.pnl) || 0);
          monthly[monthKey].count += 1;
          if (t.pnl > 0) monthly[monthKey].wins += 1;
          if (t.pnl < 0) monthly[monthKey].losses += 1;
        });
        return Object.entries(monthly)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, data]) => ({ month, ...data }));
      },
    }),
    {
      name: 'trading-pnl-storage',
    }
  )
);

// ==================== HELPERS ====================
function groupByDate(trades) {
  const map = {};
  trades.forEach((t) => {
    map[t.date] = (map[t.date] || 0) + (parseFloat(t.pnl) || 0);
  });
  return map;
}
