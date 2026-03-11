import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import TradeForm from '../components/trade/TradeForm';
import TradeTable from '../components/trade/TradeTable';

export default function Trades() {
  const [showForm, setShowForm] = useState(false);
  const [editTrade, setEditTrade] = useState(null);

  const handleEdit = (trade) => {
    setEditTrade(trade);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditTrade(null);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Trade History</h2>
            <p className="text-sm text-gray-400">Log and manage your trades</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gold/20 text-gold border border-gold/30 hover:bg-gold/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Trade
          </motion.button>
        </div>

        {/* Trade Table */}
        <GlassCard>
          <div className="p-4">
            <TradeTable onEdit={handleEdit} />
          </div>
        </GlassCard>

        {/* Trade Form Modal */}
        {showForm && (
          <TradeForm editTrade={editTrade} onClose={handleClose} />
        )}
      </div>
    </PageTransition>
  );
}
