import { format, parseISO, getDay } from 'date-fns';

/**
 * Calculate cumulative equity curve from trades
 * @param {Array} trades - Array of trade objects
 * @returns {Array} Array of { date, equity } points
 */
export function calculateEquityCurve(trades) {
  if (!trades.length) return [];

  const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date));
  let cumulative = 0;

  return sorted.map((t) => {
    cumulative += t.pnl;
    return {
      date: t.date,
      equity: Math.round(cumulative * 100) / 100,
    };
  });
}

/**
 * Calculate daily P&L aggregation
 * @param {Array} trades
 * @returns {Object} Map of date -> { pnl, count, trades }
 */
export function calculateDailyPnl(trades) {
  const map = {};
  trades.forEach((t) => {
    if (!map[t.date]) {
      map[t.date] = { pnl: 0, count: 0, trades: [] };
    }
    map[t.date].pnl += t.pnl;
    map[t.date].count += 1;
    map[t.date].trades.push(t);
  });

  Object.keys(map).forEach((k) => {
    map[k].pnl = Math.round(map[k].pnl * 100) / 100;
  });

  return map;
}

/**
 * Calculate max drawdown from trades
 * @param {Array} trades
 * @returns {{ maxDrawdown: number, maxDrawdownPct: number }}
 */
export function calculateMaxDrawdown(trades) {
  if (!trades.length) return { maxDrawdown: 0, maxDrawdownPct: 0 };

  const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date));
  let cumulative = 0;
  let peak = 0;
  let maxDrawdown = 0;

  sorted.forEach((t) => {
    cumulative += t.pnl;
    if (cumulative > peak) peak = cumulative;
    const drawdown = cumulative - peak;
    if (drawdown < maxDrawdown) maxDrawdown = drawdown;
  });

  const maxDrawdownPct = peak > 0 ? Math.round((maxDrawdown / peak) * 10000) / 100 : 0;

  return {
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    maxDrawdownPct,
  };
}

/**
 * Calculate monthly P&L aggregation
 * @param {Array} trades
 * @returns {Array} Array of { month, pnl, count }
 */
export function calculateMonthlyPnl(trades) {
  const map = {};
  trades.forEach((t) => {
    const monthKey = format(parseISO(t.date), 'yyyy-MM');
    if (!map[monthKey]) map[monthKey] = { pnl: 0, count: 0 };
    map[monthKey].pnl += t.pnl;
    map[monthKey].count += 1;
  });

  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      label: format(parseISO(`${month}-01`), 'MMM yyyy'),
      pnl: Math.round(data.pnl * 100) / 100,
      count: data.count,
    }));
}

/**
 * Calculate P&L by day of week
 * @param {Array} trades
 * @returns {Array} Array of { day, totalPnl, count, avg }
 */
export function calculateWeekdayPnl(trades) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const map = {};
  days.forEach((d, i) => {
    map[i] = { day: d, totalPnl: 0, count: 0 };
  });

  trades.forEach((t) => {
    const dayIndex = getDay(parseISO(t.date));
    map[dayIndex].totalPnl += t.pnl;
    map[dayIndex].count += 1;
  });

  return Object.values(map).map((d) => ({
    ...d,
    totalPnl: Math.round(d.totalPnl * 100) / 100,
    avg: d.count > 0 ? Math.round((d.totalPnl / d.count) * 100) / 100 : 0,
  }));
}

/**
 * Calculate streak (consecutive winning/losing days)
 * @param {Array} trades
 * @returns {{ currentStreak: number, streakType: string, maxWinStreak: number, maxLossStreak: number }}
 */
export function calculateStreaks(trades) {
  if (!trades.length) {
    return { currentStreak: 0, streakType: 'none', maxWinStreak: 0, maxLossStreak: 0 };
  }

  const dailyPnl = calculateDailyPnl(trades);
  const sortedDays = Object.entries(dailyPnl)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({ date, pnl: data.pnl }));

  let maxWinStreak = 0;
  let maxLossStreak = 0;
  let currentWin = 0;
  let currentLoss = 0;

  sortedDays.forEach(({ pnl }) => {
    if (pnl > 0) {
      currentWin++;
      currentLoss = 0;
      if (currentWin > maxWinStreak) maxWinStreak = currentWin;
    } else if (pnl < 0) {
      currentLoss++;
      currentWin = 0;
      if (currentLoss > maxLossStreak) maxLossStreak = currentLoss;
    } else {
      currentWin = 0;
      currentLoss = 0;
    }
  });

  const lastDay = sortedDays[sortedDays.length - 1];
  const streakType = lastDay?.pnl > 0 ? 'win' : lastDay?.pnl < 0 ? 'loss' : 'none';
  const currentStreak = streakType === 'win' ? currentWin : streakType === 'loss' ? currentLoss : 0;

  return { currentStreak, streakType, maxWinStreak, maxLossStreak };
}
