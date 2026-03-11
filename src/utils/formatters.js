import { format, parseISO } from 'date-fns';

/**
 * Currency formatter
 * @param {number} value - Amount to format
 * @param {string} currency - Currency code (USD, IDR, EUR, etc.)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, currency = 'USD') {
  if (currency === 'USDT') {
    return `${value >= 0 ? '' : '-'}${Math.abs(value).toFixed(2)} USDT`;
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

/**
 * P&L formatter with sign prefix
 * @param {number} value - P&L amount
 * @param {string} currency - Currency code
 * @returns {string} Formatted P&L with +/- prefix
 */
export function formatPnL(value, currency = 'USD') {
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${formatCurrency(value, currency)}`;
}

/**
 * Percentage formatter
 * @param {number} value - Percentage value
 * @returns {string} Formatted percentage with sign
 */
export function formatPercent(value) {
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(2)}%`;
}

/**
 * Date formatter - converts ISO date string to human-readable format
 * @param {string} dateStr - ISO date string (YYYY-MM-DD)
 * @returns {string} Formatted date (e.g., "Mar 4, 2026")
 */
export function formatDate(dateStr) {
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

/**
 * Get P&L color class based on value
 * @param {number} value - P&L amount
 * @returns {string} Tailwind color class
 */
export function getPnLColor(value) {
  if (value > 0) return 'text-emerald';
  if (value < 0) return 'text-ruby';
  return 'text-gray-400';
}

/**
 * Get P&L background color class
 * @param {number} value - P&L amount
 * @returns {string} Tailwind bg color class
 */
export function getPnLBgColor(value) {
  if (value > 0) return 'bg-emerald/20';
  if (value < 0) return 'bg-ruby/20';
  return 'bg-gray-500/20';
}

/**
 * Short number formatter (1.2K, 3.5M, etc.)
 * @param {number} value
 * @returns {string}
 */
export function formatShortNumber(value) {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}K`;
  return `${sign}${abs.toFixed(2)}`;
}
