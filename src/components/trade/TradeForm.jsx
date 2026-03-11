import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Save } from 'lucide-react';
import { useTradeStore } from '../../stores/useTradeStore';

const defaultForm = {
  pair: '',
  type: 'long',
  entryPrice: '',
  exitPrice: '',
  pnl: '',
  date: new Date().toISOString().split('T')[0],
  time: new Date().toTimeString().slice(0, 5),
  notes: '',
};

export default function TradeForm({ editTrade = null, onClose }) {
  const { addTrade, updateTrade } = useTradeStore();
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editTrade) {
      setForm({
        pair: editTrade.pair || '',
        type: editTrade.type || 'long',
        entryPrice: editTrade.entryPrice?.toString() || '',
        exitPrice: editTrade.exitPrice?.toString() || '',
        pnl: editTrade.pnl?.toString() || '',
        date: editTrade.date || new Date().toISOString().split('T')[0],
        time: editTrade.time || '00:00',
        notes: editTrade.notes || '',
      });
    }
  }, [editTrade]);

  const validate = () => {
    const errs = {};
    if (!form.pair.trim()) errs.pair = 'Trading pair is required';
    if (!form.pnl || isNaN(Number(form.pnl))) errs.pnl = 'Valid P&L amount is required';
    if (!form.date) errs.date = 'Date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const tradeData = {
      pair: form.pair.toUpperCase().trim(),
      type: form.type,
      entryPrice: form.entryPrice ? Number(form.entryPrice) : null,
      exitPrice: form.exitPrice ? Number(form.exitPrice) : null,
      pnl: Number(form.pnl),
      date: form.date,
      time: form.time,
      notes: form.notes.trim(),
    };

    if (editTrade) {
      updateTrade(editTrade.id, tradeData);
    } else {
      addTrade(tradeData);
    }

    setForm(defaultForm);
    setErrors({});
    if (onClose) onClose();
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const inputClass = (field) =>
    `w-full bg-white/[0.05] border ${
      errors[field] ? 'border-ruby/50' : 'border-white/[0.08]'
    } rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-[#111827]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {editTrade ? 'Edit Trade' : 'Add New Trade'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Pair + Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Trading Pair</label>
                <input
                  type="text"
                  placeholder="e.g. BTC/USDT"
                  value={form.pair}
                  onChange={(e) => handleChange('pair', e.target.value)}
                  className={inputClass('pair')}
                />
                {errors.pair && <p className="text-ruby text-xs mt-1">{errors.pair}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Type</label>
                <div className="flex gap-2">
                  {['long', 'short'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleChange('type', t)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        form.type === t
                          ? t === 'long'
                            ? 'bg-emerald/20 text-emerald border border-emerald/30'
                            : 'bg-ruby/20 text-ruby border border-ruby/30'
                          : 'bg-white/[0.05] text-gray-400 border border-white/[0.08] hover:bg-white/10'
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Entry + Exit Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Entry Price</label>
                <input
                  type="number"
                  step="any"
                  placeholder="Optional"
                  value={form.entryPrice}
                  onChange={(e) => handleChange('entryPrice', e.target.value)}
                  className={inputClass('entryPrice')}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Exit Price</label>
                <input
                  type="number"
                  step="any"
                  placeholder="Optional"
                  value={form.exitPrice}
                  onChange={(e) => handleChange('exitPrice', e.target.value)}
                  className={inputClass('exitPrice')}
                />
              </div>
            </div>

            {/* Row 3: P&L + Date + Time */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">P&L ($)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 150.50"
                  value={form.pnl}
                  onChange={(e) => handleChange('pnl', e.target.value)}
                  className={inputClass('pnl')}
                />
                {errors.pnl && <p className="text-ruby text-xs mt-1">{errors.pnl}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className={inputClass('date')}
                />
                {errors.date && <p className="text-ruby text-xs mt-1">{errors.date}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Time</label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  className={inputClass('time')}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Notes</label>
              <textarea
                placeholder="Trade notes (optional)"
                rows={2}
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className={`${inputClass('notes')} resize-none`}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-bold bg-gold/20 text-gold border border-gold/30 hover:bg-gold/30 transition-all flex items-center justify-center gap-2"
            >
              {editTrade ? (
                <><Save className="w-4 h-4" /> Update Trade</>
              ) : (
                <><Plus className="w-4 h-4" /> Add Trade</>
              )}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
