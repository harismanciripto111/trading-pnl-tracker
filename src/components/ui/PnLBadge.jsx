import { formatPnL, getPnLColor, getPnLBgColor } from '../../utils/formatters';

export default function PnLBadge({ value, currency = 'USD', size = 'sm' }) {
  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-sm px-2.5 py-1',
    md: 'text-base px-3 py-1.5',
    lg: 'text-lg px-4 py-2',
  };

  return (
    <span
      className={`
        inline-flex items-center font-mono font-semibold rounded-lg
        ${getPnLColor(value)}
        ${getPnLBgColor(value)}
        ${sizeClasses[size] || sizeClasses.sm}
      `}
    >
      {formatPnL(value, currency)}
    </span>
  );
}
