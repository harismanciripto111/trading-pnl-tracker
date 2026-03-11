import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  Upload,
  Trash2,
  DollarSign,
  Info,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import ConfirmModal from '../components/ui/ConfirmModal';
import { useTradeStore } from '../stores/useTradeStore';
import { useSettingsStore } from '../stores/useSettingsStore';

export default function Settings() {
  const { trades, clearAllTrades, importTrades } = useTradeStore();
  const { currency, setCurrency, currencies } = useSettingsStore();
  const fileInputRef = useRef(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = () => {
    try {
      const data = JSON.stringify(trades, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trading-pnl-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Exported ${trades.length} trades successfully`);
    } catch (err) {
      showToast('Failed to export data', 'error');
    }
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!Array.isArray(data)) throw new Error('Invalid format');
        importTrades(data);
        showToast(`Imported ${data.length} trades successfully`);
      } catch (err) {
        showToast('Invalid JSON file. Please check the format.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClear = () => {
    clearAllTrades();
    showToast('All trades have been cleared');
  };

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Currency Settings */}
        <GlassCard>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-gold/20">
                <DollarSign className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Currency Display</h3>
                <p className="text-xs text-gray-400">Choose how P&L values are displayed</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {currencies.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCurrency(c.code)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    currency === c.code
                      ? 'bg-gold/20 text-gold border border-gold/30'
                      : 'bg-white/[0.05] text-gray-400 border border-white/[0.08] hover:bg-white/10'
                  }`}
                >
                  <span className="text-lg">{c.symbol}</span>
                  <span className="ml-2">{c.code}</span>
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Export/Import */}
        <GlassCard>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-blue-500/20">
                <Download className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Backup & Restore</h3>
                <p className="text-xs text-gray-400">Export or import your trade data as JSON</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                disabled={trades.length === 0}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-emerald/10 text-emerald border border-emerald/20 hover:bg-emerald/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Export Data ({trades.length} trades)
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
              >
                <Upload className="w-4 h-4" />
                Import Data
              </motion.button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>
          </div>
        </GlassCard>

        {/* Danger Zone */}
        <GlassCard>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-ruby/20">
                <Trash2 className="w-5 h-5 text-ruby" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Danger Zone</h3>
                <p className="text-xs text-gray-400">Irreversible actions</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowClearModal(true)}
              disabled={trades.length === 0}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-ruby/10 text-ruby border border-ruby/20 hover:bg-ruby/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </motion.button>
          </div>
        </GlassCard>

        {/* About */}
        <GlassCard>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-white/10">
                <Info className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">About</h3>
                <p className="text-xs text-gray-400">Trading P&L Tracker v1.0.0</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              A personal trading journal for tracking daily profit and loss. All data is stored
              locally in your browser using localStorage. No data is sent to any server.
            </p>
          </div>
        </GlassCard>

        {/* Clear Confirmation Modal */}
        <ConfirmModal
          isOpen={showClearModal}
          onClose={() => setShowClearModal(false)}
          onConfirm={handleClear}
          title="Clear All Data"
          message="This will permanently delete all your trade data. This action cannot be undone. Make sure to export a backup first."
        />

        {/* Toast Notification */}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-xl backdrop-blur-xl border ${
                toast.type === 'error'
                  ? 'bg-ruby/20 text-ruby border-ruby/30'
                  : 'bg-emerald/20 text-emerald border-emerald/30'
              }`}
            >
              {toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {toast.message}
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
