import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', hover = true, onClick }) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.01, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={`
        bg-white/[0.05] backdrop-blur-xl
        border border-white/[0.08]
        rounded-2xl
        ${hover ? 'hover:bg-white/[0.08] hover:border-white/[0.12] hover:shadow-lg hover:shadow-black/20' : ''}
        transition-colors duration-300
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
