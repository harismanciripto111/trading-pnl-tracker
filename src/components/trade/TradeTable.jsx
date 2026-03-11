import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Trash2, ChevronUp, ChevronDown, Search, Filter } from 'lucide-react';
import { useTradeStore } from '../../stores/useTradeStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { formatCurrency, formatDate } from '../../utils/formatters';
import ConfirmModal from '../ui/ConfirmModal';

export default function TradeTable({ onEdit }) {
  const { trades, removeTrade } = useTradeStore();
  const { currency } = useSettingsStore();

  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, profit, loss
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUp className="w-3 h-3 text-gray-600" />;
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-gold" />
    ) : (
      <ChevronDown className="w-3 h-3 text-gold" />
    );
  };

  const filteredTrades = useMemo(() => {
    let result = [...trades];

    // Search filter (now includes source)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.pair.toLowerCase().includes(q) ||
          t.source?.toLowerCase().includes(q) ||
          t.notes?.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (filterType === 'profit') result = result.filter((t) => t.pnl > 0);
    if (filterType === 'loss') result = result.filter((t) => t.pnl < 0);

    // Sort
    result.sort((a, b) => {
      let valA, valB;
      if (sortField === 'date') {
        valA = new Date(`${a.date}T${a.time || '00:00'}`);
        valB = new Date(`${b.date}T${b.time || '00:00'}`);
      } else if (sortField === 'pnl') {
        valA = a.pnl;
        valB = b.pnl;
      } else if (sortField === 'pair') {
        valA = a.pair;
        valB = b.pair;
      } else if (sortField === 'source') {
        valA = a.source || '';
        valB = b.source || '';
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [trades, searchQuery, filterType, sortField, sortDir]);

  if (trades.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">No trades yet</p>
        <p className="text-gray-600 text-sm mt-1">Add your first trade to get started</p>
      </div>
    );
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by pair, source, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gold/50 transition-colors"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'profit', label: 'Profit' },
            { key: 'loss', label: 'Loss' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                filterType === f.key
                  ? f.key === 'profit'
                    ? 'bg-emerald/20 text-emerald border border-emerald/30'
                    : f.key === 'loss'
                    ? 'bg-ruby/20 text-ruby border border-ruby/30'
                    : 'bg-gold/20 text-gold border border-gold/30'
                  : 'bg-white/[0.05] text-gray-400 border border-white/[0.08] hover:bg-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/[0.03]">
              <th
                onClick={() => handleSort('date')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
              >
                <span className="flex items-center gap-1">Date <SortIcon field="date" /></span>
              </th>
              <th
                onClick={() => handleSort('pair')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
              >
                <span className="flex items-center gap-1">Pair <SortIcon field="pair" /></span>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
              <th
                onClick={() => handleSort('source')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
              >
                <span className="flex items-center gap-1">Source <SortIcon field="source" /></span>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Entry</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Exit</th>
              <th
                onClick={() => handleSort('pnl')}
                className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
              >
                <span className="flex items-center justify-end gap-1">P&L <SortIcon field="pnl" /></span>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            <AnimatePresence>
              {filteredTrades.map((trade, index) => (
                <motion.tr
                  key={trade.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.02 }}
                  className="hover:bg-white/[0.03] transition-colors"
                >
                  <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                    <div>{formatDate(trade.date)}</div>
                    <div className="text-xs text-gray-500">{trade.time || '--:--'}</div>
                  </td>
                  <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{trade.pair}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                        trade.type === 'long'
                          ? 'bg-emerald/20 text-emerald'
                          : 'bg-ruby/20 text-ruby'
                      }`}
                    >
                      {trade.type?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-white/[0.08] text-gray-300">
                      {trade.source || '--'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs whitespace-nowrap">
                    {trade.entryPrice ? `$${trade.entryPrice.toLocaleString()}` : '--'}
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs whitespace-nowrap">
                    {trade.exitPrice ? `$${trade.exitPrice.toLocaleString()}` : '--'}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-mono font-bold whitespace-nowrap ${
                      trade.pnl >= 0 ? 'text-emerald' : 'text-ruby'
                    }`}
                  >
                    {trade.pnl >= 0 ? '+' : ''}
                    {formatCurrency(trade.pnl, currency)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(trade)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-gold transition-colors"
                        title="Edit trade"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(trade)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-ruby transition-colors"
                        title="Delete trade"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Results count */}
      <div className="mt-3 text-xs text-gray-500">
        Showing {filteredTrades.length} of {trades.length} trades
      </div>

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && removeTrade(deleteTarget.id)}
        title="Delete Trade"
        message={`Are you sure you want to delete the ${deleteTarget?.pair} trade from ${deleteTarget?.date}? This action cannot be undone.`}
      />
    </>
  );
}
