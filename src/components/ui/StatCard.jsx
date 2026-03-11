import { motion } from 'framer-motion';

export default function StatCard({ title, value, icon: Icon, trend, trendLabel, colorClass = 'text-gold' }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5
        hover:bg-white/[0.08] hover:border-gold/10 hover:shadow-lg hover:shadow-gold/5
        transition-colors duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-xl bg-white/[0.05]">
          {Icon && <Icon size={20} className={colorClass} />}
        </div>
        {trend !== undefined && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-lg ${
              trend >= 0
                ? 'text-profit bg-profit/10'
                : 'text-loss bg-loss/10'
            }`}
          >
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>

      <p className="text-xs text-gray-400 mb-1">{title}</p>
      <p className={`text-xl font-bold font-mono tracking-tight ${colorClass}`}>
        {value}
      </p>
      {trendLabel && (
        <p className="text-xs text-gray-500 mt-1">{trendLabel}</p>
      )}
    </motion.div>
  );
}
