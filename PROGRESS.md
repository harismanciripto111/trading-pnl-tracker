# PROGRESS.md - Trading P&L Tracker

## [DONE] - Session 1 (2026-03-11)

### Bug Fixes - All Build-Breaking Errors Resolved

1. **tailwind.config.js** - Added `emerald` and `ruby` color aliases
   - Components used `text-emerald`, `bg-emerald/20`, `text-ruby`, `bg-ruby/20` but config only had `profit` and `loss`
   - Added emerald and ruby objects with DEFAULT, light, dark, glow variants (matching profit/loss values)

2. **src/stores/useTradeStore.js** - Added `getStats()` and `deleteTrade()`
   - Dashboard.jsx called `getStats()` which didn't exist -- added it returning { totalPnl, monthlyPnl, winRate, totalTrades, bestDay, worstDay }
   - TradeTable.jsx called `deleteTrade()` which didn't exist -- added as alias for `removeTrade()`

3. **src/utils/formatters.js** - Added `formatDate()` function
   - Dashboard.jsx, TradeTable.jsx, and Header.jsx all imported `formatDate` but it didn't exist
   - Added `formatDate(dateStr)` using date-fns `format(parseISO(dateStr), 'MMM d, yyyy')`

4. **src/components/layout/AnimatedBackground.jsx** - Removed unused `useCallback` import

---

## [DONE] - Session 2 (2026-03-11)

### Build Config Fixes

1. **src/index.css** - Moved `@import url(Google Fonts)` to line 1, above `@tailwind` directives
   - CSS spec requires `@import` to be the very first statement
   - Commit: `8b02ac5`

2. **vite.config.js** - Changed `open: true` to `open: false`
   - VPS has no GUI/browser, so `xdg-open` command was failing
   - Commit: `dd095da`

---

## [DONE] - Session 2.1 (2026-03-11)

### VPS Network Access Fix

1. **vite.config.js** - Added `host: '0.0.0.0'` to server config
   - Vite was only listening on `localhost` (127.0.0.1), not accessible from external IPs
   - Now binds to all network interfaces so `http://VPS_IP:3000` works from local browser

---

## [DONE] - Session 3 (2026-03-11)

### Feature: Source/Platform Tracking + Dashboard Fix

**Goal:** Enable manual input of profit/loss with detailed source info (which platform/exchange the trade came from).

#### Changes Made

1. **src/stores/useTradeStore.js** (`767d2d2`)
   - Added `getStats()` function returning unified stats object: `{ totalPnl, monthlyPnl, winRate, totalTrades, bestDay, worstDay, pnlBySource }`
   - Added `source` field support in trade data
   - Added `pnlBySource` aggregation -- groups P&L and trade count by platform
   - Kept all existing individual getter functions intact

2. **src/components/trade/TradeForm.jsx** (`c78c429`)
   - Added **Source/Platform selector** with 7 preset options: Binance, Bybit, OKX, Tokocrypto, Forex, Saham, Other
   - 4-column button grid for quick selection, gold highlight on active
   - "Other" option shows custom text input for any platform name
   - Source is required field with validation
   - Edit mode auto-detects preset vs custom source
   - Added Cancel button, scroll support for modal (`max-h-[90vh]`)

3. **src/components/trade/TradeTable.jsx** (`d5b9e43`)
   - Added **Source column** with sortable header
   - Source displayed as styled badge (`bg-white/[0.08]`)
   - **Bug fix:** Changed `deleteTrade` to `removeTrade` (matching actual store method)
   - Search now includes source field (search by pair, source, or notes)
   - Sort logic extended with source field support

4. **src/pages/Dashboard.jsx** (`192f5bb`)
   - Dashboard now correctly calls `getStats()` from the updated store
   - Added **source badge** to Recent Trades list (small inline tag showing platform)
   - **Typo fix:** `text-gray--400` corrected to `text-gray-400` in Best Day section

#### New Trade Data Structure
```json
{
  "pair": "BTC/USDT",
  "type": "long",
  "entryPrice": 65000,
  "exitPrice": 67000,
  "pnl": 200,
  "source": "Binance",
  "date": "2026-03-11",
  "time": "14:30",
  "notes": "Breakout trade on 4H chart",
  "id": "auto-generated-uuid",
  "createdAt": 1741686600000
}
```

---

## [DONE] - Session 5 (2026-03-11)

### Bug Fix: Airdrop P&L Not Showing on Dashboard ($0.00 bug)

**Problem:** User added $1100 airdrop profit, but Dashboard Airdrop Gains card showed +$0.00 and 0 airdrops.

**Root Cause:** No defensive numeric conversion in the data pipeline. While TradeForm.jsx correctly calls Number(form.pnl) on submit, multiple vulnerability paths existed:
- importTrades() did zero validation on imported JSON data
- addTrade() and updateTrade() had no defensive parseFloat
- All arithmetic in getStats() and other getters used raw t.pnl without conversion
- Any corrupted/imported data with string pnl values would break ALL calculations

**Fix Applied:** 13 changes to src/stores/useTradeStore.js - defensive parseFloat(t.pnl) || 0 on all arithmetic operations across addTrade, updateTrade, importTrades, getStats, getTotalPnL, getMonthlyPnL, getEquityCurve, getPnLByDayOfWeek, getMonthlyBreakdown, and groupByDate.

---

## [NEXT SESSION] - Suggested Next Steps

1. Test airdrop flow end-to-end: Add airdrop trade via form, verify Dashboard card shows correct value
2. Check existing localStorage data: If old trades have string pnl values, export > fix > reimport
3. Add P&L by Category chart on Analytics page
4. Add P&L by Source breakdown on Analytics page  
5. Import/Export trades as CSV/JSON for backup

---

## Architecture Notes (for context recovery)
- **Stack:** React 18 + Vite + TailwindCSS + Framer Motion + Recharts + Zustand
- **State:** Zustand with localStorage persistence (trading-pnl-storage key)
- **No backend** - all data in localStorage
- **Key stores:** useTradeStore (trades + getStats + individual getters + getTradesByCategory), useSettingsStore
- **Source options:** Binance, Bybit, OKX, Tokocrypto, Forex, Saham, Other
- **Trade categories:** trading (default), degen (simplified), airdrop (simplified)
- **Numeric safety:** All pnl/price arithmetic uses parseFloat(t.pnl) || 0 pattern
