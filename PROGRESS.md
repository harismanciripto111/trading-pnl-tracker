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

---

## [DONE] - Session 4 (2026-03-11)

### Feature: Degen & Airdrop Trade Categories

**Goal:** Add simplified trade entry for Degen plays and Airdrop gains -- no need to fill long/short, entry/exit prices. Just token name, P&L, source, date, and notes.

#### Changes Made

1. **PLAN.md** (`1a540f0`)
   - Updated Trade Logger section to include category selector (Trading/Degen/Airdrop)
   - Documented simplified Degen/Airdrop mode (no long/short, no entry/exit)
   - Added category filtering and badge display to trade history table spec

2. **src/stores/useTradeStore.js** (`cace377`)
   - Added `pnlByCategory` aggregation to `getStats()` -- groups P&L and trade count by category (trading/degen/airdrop)
   - Added `getTradesByCategory(category)` getter -- filter trades by category
   - Backward compatible: trades without `category` field default to `'trading'`
   - `pnlByCategory` returned in stats object for Dashboard use

3. **src/components/trade/TradeForm.jsx** (`5af17aa`)
   - Added **Category Selector** at top of form: Trading (gold, TrendingUp icon) / Degen (purple, Zap icon) / Airdrop (cyan, Gift icon)
   - **Simple Mode** (`isSimpleMode`): when Degen or Airdrop is selected, hides Long/Short toggle and Entry/Exit price fields
   - Dynamic labels: "Token / Pair" for degen/airdrop, "Pair / Asset" for trading
   - Dynamic placeholders: "e.g. PEPE, ARB, WEN" for degen/airdrop, "BTC/USDT" for trading
   - P&L label changes to "Airdrop Value (USD)" for airdrops
   - Submit button color and icon adapts per category (purple Zap for degen, cyan Gift for airdrop)
   - Notes placeholder is context-aware per category
   - Edit mode correctly loads `category` field from existing trade data

4. **src/components/trade/TradeTable.jsx** (`feat commit`)
   - Added **Category column** with sortable header and colored badge + icon (Trading=gold, Degen=purple, Airdrop=cyan)
   - Added **Category Filter Row** below toolbar: All Categories / Trading / Degen / Airdrop buttons
   - Search now includes category field
   - Sort logic extended with category field
   - Type column shows `--` for degen/airdrop trades (no long/short)
   - Removed Entry/Exit columns to streamline table (data still stored, just not displayed in table)

5. **src/pages/Dashboard.jsx** (`feat commit`)
   - Added **Degen P&L card** with purple Zap icon showing total degen profit/loss and trade count
   - Added **Airdrop Gains card** with cyan Gift icon showing total airdrop value and count
   - Rearranged layout: stat cards row + category/best/worst row (4 columns) + equity curve + recent trades
   - Recent Trades now shows **category badge** next to pair name (color-coded icon + label)
   - All category cards show `pnlByCategory` data from store's `getStats()`

#### Updated Trade Data Structure
```json
{
  "category": "degen",
  "pair": "PEPE",
  "type": null,
  "entryPrice": null,
  "exitPrice": null,
  "pnl": 500,
  "source": "Bybit",
  "date": "2026-03-11",
  "time": "16:00",
  "notes": "Memecoin pump, sold at peak",
  "id": "auto-generated-uuid",
  "createdAt": 1741686600000
}
```

---

## [NEXT SESSION] - Suggested Next Steps

1. **Test the full flow on VPS:** Run `npm run dev`, add trades with each category (Trading/Degen/Airdrop), verify form simplification, table display, and dashboard cards
2. **Tailwind safelist check:** Verify `purple-400` and `cyan-400` colors render correctly -- may need to add them to `tailwind.config.js` safelist if tree-shaking removes them
3. **Add P&L by Category chart** on Analytics page (pie chart or bar chart showing profit per category)
4. **Add P&L by Source breakdown** on Analytics page (pie chart or bar chart showing profit per platform)
5. **Import/Export trades** as CSV/JSON for backup
6. **Advanced filtering** by source/platform on Trades page
7. **Date range picker** for Dashboard stats

---

## Architecture Notes (for context recovery)
- **Stack:** React 18 + Vite + TailwindCSS + Framer Motion + Recharts + Zustand
- **State:** Zustand with localStorage persistence (`trading-pnl-storage` key)
- **No backend** - all data in localStorage (structure ready for DB migration)
- **Color system:** emerald = profit green (#00c48c), ruby = loss red (#ff4d6a), gold = accent (#f0b90b), purple-400 = degen, cyan-400 = airdrop
- **Key stores:** useTradeStore (trades + getStats + individual getters + getTradesByCategory), useSettingsStore (currency, theme prefs)
- **Source options:** Binance, Bybit, OKX, Tokocrypto, Forex, Saham, Other (custom input)
- **Trade categories:** trading (default, full form), degen (simplified), airdrop (simplified)
- **Category field:** backward compatible -- old trades without `category` default to `'trading'`