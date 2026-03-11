import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Save, Zap, Gift, TrendingUp } from 'lucide-react';
import { useTradeStore } from '../../stores/useTradeStore';

const SOURCE_OPTIONS = [
  'Binance',
  'Bybit',
  'OKX',
  'Tokocrypto',
  'Forex',
  'Saham',
  'Other',
];

const CATEGORY_OPTIONS = [
  { key: 'trading', label: 'Trading', icon: 'TrendingUp', color: 'gold', desc: 'Regular long/short trades' },
  { key: 'degen', label: 'Degen', icon: 'Zap', color: 'purple-400', desc: 'Degen plays, memecoins, etc' },
  { key: 'airdrop', label: 'Airdrop', icon: 'Gift', color: 'cyan-400', desc: 'Free tokens from airdrops' },
];

const categoryIcons = {
  trading: TrendingUp,
  degen: Zap,
  airdrop: Gift,
};

const defaultForm = {
  category: 'trading',
  pair: '',
  type: 'long',
  entryPrice: '',
  exitPrice: '',
  pnl: '',
  source: '',
  customSource: '',
  date: new Date().toISOString().split('T')[0],
  time: new Date().toTimeString().slice(0, 5),
  notes: '',
};

export default function TradeForm({ editTrade = null, onClose }) {
  const { addTrade, updateTrade } = useTradeStore();
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});

  const isSimpleMode = form.category === 'degen' || form.category === 'airdrop';

  useEffect(() => {
    if (editTrade) {
      const isPreset = SOURCE_OPTIONS.includes(editTrade.source);
      setForm({
        category: editTrade.category || 'trading',
        pair: editTrade.pair || '',
        type: editTrade.type || 'long',
        entryPrice: editTrade.entryPrice?.toString() || '',
        exitPrice: editTrade.exitPrice?.toString() || '',
        pnl: editTrade.pnl?.toString() || '',
        source: isPreset ? editTrade.source : (editTrade.source ? 'Other' : ''),
        customSource: isPreset ? '' : (editTrade.source || ''),
        date: editTrade.date || new Date().toISOString().split('T')[0],
        time: editTrade.time || '00:00',
        notes: editTrade.notes || '',
      });
    }
  }, [editTrade]);

  const validate = () => {
    const errs = {};
    if (!form.pair.trim()) errs.pair = isSimpleMode ? 'Token/pair is required' : 'Trading pair is required';
    if (!form.pnl || isNaN(Number(form.pnl))) errs.pnl = 'Valid P&L amount is required';
    if (!form.date) errs.date = 'Date is required';
    if (!form.source) errs.source = 'Source/Platform is required';
    if (form.source === 'Other' && !form.customSource.trim()) errs.customSource = 'Please specify the source';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const tradeData = {
      category: form.category,
      pair: form.pair.toUpperCase().trim(),
      type: isSimpleMode ? null : form.type,
      entryPrice: isSimpleMode ? null : (form.entryPrice ? Number(form.entryPrice) : null),
      exitPrice: isSimpleMode ? null : (form.exitPrice ? Number(form.exitPrice) : null),
      pnl: Number(form.pnl),
      source: form.source === 'Other' ? form.customSource.trim() : form.source,
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
          className="w-full max-w-lg bg-[#111827]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">
              {editTrade ? 'Edit Trade' : 'Add New Trade'}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Selector */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORY_OPTIONS.map((cat) => {
                  const Icon = categoryIcons[cat.key];
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => handleChange('category', cat.key)}
                      className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-medium border transition-all ${
                        form.category === cat.key
                          ? cat.key === 'trading'
                            ? 'bg-gold/20 border-gold/30 text-gold'
                            : cat.key === 'degen'
                            ? 'bg-purple-400/20 border-purple-400/30 text-purple-400'
                            : 'bg-cyan-400/20 border-cyan-400/30 text-cyan-400'
                          : 'bg-white/[0.05] border-white/[0.08] text-gray-400 hover:bg-white/[0.08]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
              {isSimpleMode && (
                <p className="text-xs text-gray-500 mt-1.5">
                  {form.category === 'degen' ? 'Simplified form - no need for long/short or entry/exit prices' : 'Simplified form - just log your airdrop gains'}
                </p>
              )}
            </div>

            {/* Row 1: Pair + Type (type only for trading) */}
            <div className={`grid ${isSimpleMode ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  {isSimpleMode ? 'Token / Pair *' : 'Pair / Asset *'}
                </label>
                <input
                  type="text"
                  value={form.pair}
                  onChange={(e) => handleChange('pair', e.target.value)}
                  placeholder={isSimpleMode ? 'e.g. PEPE, ARB, WEN' : 'BTC/USDT'}
                  className={inputClass('pair')}
                />
                {errors.pair && (
                  <p className="text-ruby text-xs mt-1">{errors.pair}</p>
                )}
              </div>

              {!isSimpleMode && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Type
                  </label>
                  <div className="flex gap-2">
                    {['long', 'short'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleChange('type', t)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                          form.type === t
                            ? t === 'long'
                              ? 'bg-emerald/20 border-emerald/30 text-emerald'
                              : 'bg-ruby/20 border-ruby/30 text-ruby'
                            : 'bg-white/[0.05] border-white/[0.08] text-gray-400 hover:bg-white/[0.08]'
                        }`}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Row 2: Source/Platform */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Source / Platform *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {SOURCE_OPTIONS.map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => {
                      handleChange('source', src);
                      if (src !== 'Other') handleChange('customSource', '');
                    }}
                    className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                      form.source === src
                        ? 'bg-gold/20 border-gold/30 text-gold'
                        : 'bg-white/[0.05] border-white/[0.08] text-gray-400 hover:bg-white/[0.08]'
                    }`}
                  >
                    {src}
                  </button>
                ))}
              </div>
              {errors.source && (
                <p className="text-ruby text-xs mt-1">{errors.source}</p>
              )}
              {form.source === 'Other' && (
                <input
                  type="text"
                  value={form.customSource}
                  onChange={(e) => handleChange('customSource', e.target.value)}
                  placeholder="Enter platform name..."
                  className={`${inputClass('customSource')} mt-2`}
                />
              )}
              {errors.customSource && (
                <p className="text-ruby text-xs mt-1">{errors.customSource}</p>
              )}
            </div>

            {/* Row 3: Entry & Exit Price (only for trading) */}
            {!isSimpleMode && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Entry Price
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={form.entryPrice}
                    onChange={(e) => handleChange('entryPrice', e.target.value)}
                    placeholder="0.00"
                    className={inputClass('entryPrice')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Exit Price
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={form.exitPrice}
                    onChange={(e) => handleChange('exitPrice', e.target.value)}
                    placeholder="0.00"
                    className={inputClass('exitPrice')}
                  />
                </div>
              </div>
            )}

            {/* Row 4: P&L */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                {isSimpleMode ? (form.category === 'airdrop' ? 'Airdrop Value (USD) *' : 'Profit / Loss *') : 'Profit / Loss (P&L) *'}
              </label>
              <input
                type="number"
                step="any"
                value={form.pnl}
                onChange={(e) => handleChange('pnl', e.target.value)}
                placeholder={isSimpleMode ? (form.category === 'airdrop' ? 'Value received in USD' : 'Enter P&L amount') : 'Enter amount (positive = profit, negative = loss)'}
                className={inputClass('pnl')}
              />
              {errors.pnl && (
                <p className="text-ruby text-xs mt-1">{errors.pnl}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {form.category === 'airdrop'
                  ? 'Enter the USD value of tokens received'
                  : 'Use positive numbers for profit, negative for loss (e.g. -50)'}
              </p>
            </div>

            {/* Row 5: Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Date *
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className={inputClass('date')}
                />
                {errors.date && (
                  <p className="text-ruby text-xs mt-1">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Time
                </label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  className={inputClass('time')}
                />
              </div>
            </div>

            {/* Row 6: Notes */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder={
                  form.category === 'airdrop'
                    ? 'Which airdrop, claim details...'
                    : form.category === 'degen'
                    ? 'Degen play details, what happened...'
                    : 'Strategy, reason for entry, lessons learned...'
                }
                rows={3}
                className={`${inputClass('notes')} resize-none`}
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-white/[0.05] border border-white/[0.08] text-gray-400 hover:bg-white/[0.08] transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-2 ${
                  form.category === 'degen'
                    ? 'bg-purple-400/20 border-purple-400/30 text-purple-400 hover:bg-purple-400/30'
                    : form.category === 'airdrop'
                    ? 'bg-cyan-400/20 border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/30'
                    : 'bg-gold/20 border-gold/30 text-gold hover:bg-gold/30'
                }`}
              >
                {editTrade ? (
                  <>
                    <Save className="w-4 h-4" /> Update Trade
                  </>
                ) : (
                  <>
                    {form.category === 'degen' ? <Zap className="w-4 h-4" /> : form.category === 'airdrop' ? <Gift className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {form.category === 'airdrop' ? 'Add Airdrop' : form.category === 'degen' ? 'Add Degen Trade' : 'Add Trade'}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
