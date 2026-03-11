# AGENT.md - Vibecoding Instructions

> This file contains coding conventions, patterns, and guidelines for AI-assisted development (vibecoding) of the Trading P&L Tracker. Follow these rules strictly when generating or modifying code.

---

## Project Identity

- **App Name:** Trading P&L Tracker
- **Purpose:** Personal trading profit/loss tracking with calendar view, analytics, and trade logging
- **Stack:** React 18 + Vite + TailwindCSS + Framer Motion + Recharts + Zustand
- **Target:** Single-page app, no backend, localStorage only
- **Users:** Solo trader running on local VPS

---

## React Component Patterns

### File Naming
- Components: `PascalCase.jsx` (e.g., `StatCard.jsx`, `TradeForm.jsx`)
- Stores: `camelCase.js` with `use` prefix (e.g., `useTradeStore.js`)
- Utils: `camelCase.js` (e.g., `calculations.js`, `formatters.js`)
- Pages: `PascalCase.jsx` in `/pages` folder

### Component Structure
Always follow this order inside a component file:

```jsx
// 1. Imports (React, libraries, components, stores, utils)
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { useTradeStore } from '../stores/useTradeStore';
import GlassCard from '../components/ui/GlassCard';

// 2. Constants (if any)
const ANIMATION_DURATION = 0.3;

// 3. Component function (always named export + default export)
export default function Dashboard() {
  // 3a. Store hooks
  const { trades, addTrade } = useTradeStore();
  
  // 3b. Local state
  const [filter, setFilter] = useState('all');
  
  // 3c. Computed values (useMemo)
  const totalPnL = useMemo(() => 
    trades.reduce((sum, t) => sum + t.pnl, 0), [trades]
  );
  
  // 3d. Handlers
  const handleFilterChange = (value) => setFilter(value);
  
  // 3e. Return JSX
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Component content */}
    </motion.div>
  );
}
```

### Rules
- **Always use function declarations** (`function Component()`) not arrow functions for components
- **Always use `export default function`** pattern
- **No class components** - functional only
- **No `React.FC` or TypeScript** - plain JSX
- **Props destructuring** in function params: `function Card({ title, value, icon })`
- **Keep components under 150 lines** - extract sub-components if larger
- **One component per file** - no multi-component files

---

## Hooks Conventions

### useState
```jsx
// Good: descriptive names, always array destructure
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedDate, setSelectedDate] = useState(null);
const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

// Bad: vague names
const [open, setOpen] = useState(false);
const [data, setData] = useState(null);
```

### useMemo / useCallback
- Use `useMemo` for expensive calculations (filtering trades, computing stats)
- Use `useCallback` for handlers passed to child components
- Don't over-optimize - skip for simple values

```jsx
// Good: expensive computation
const monthlyStats = useMemo(() => {
  return calculateMonthlyPnL(trades, selectedMonth);
}, [trades, selectedMonth]);

// Bad: unnecessary memo
const isProfit = useMemo(() => pnl > 0, [pnl]); // Too simple, just use const
```

### useEffect
- Always include cleanup functions for subscriptions/timers
- Keep effects focused - one effect per concern
- Add comments explaining WHY the effect exists

```jsx
// Good: clear purpose
useEffect(() => {
  // Sync trades to localStorage whenever they change
  localStorage.setItem('trades', JSON.stringify(trades));
}, [trades]);
```

---

## Zustand State Management

### Store Pattern
```jsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useTradeStore = create(
  persist(
    (set, get) => ({
      // State
      trades: [],
      
      // Actions (always prefix with verb)
      addTrade: (trade) => set((state) => ({
        trades: [...state.trades, { ...trade, id: crypto.randomUUID() }]
      })),
      
      removeTrade: (id) => set((state) => ({
        trades: state.trades.filter(t => t.id !== id)
      })),
      
      updateTrade: (id, updates) => set((state) => ({
        trades: state.trades.map(t => t.id === id ? { ...t, ...updates } : t)
      })),
      
      // Computed getters (use get())
      getTotalPnL: () => get().trades.reduce((sum, t) => sum + t.pnl, 0),
      
      getTradesByDate: (dateStr) => get().trades.filter(
        t => t.date === dateStr
      ),
    }),
    {
      name: 'trading-pnl-storage', // localStorage key
    }
  )
);
```

### Rules
- **Always use `persist` middleware** for localStorage sync
- **Action names start with verbs:** `addTrade`, `removeTrade`, `updateTrade`, `clearAll`
- **Getter names start with `get`:** `getTotalPnL`, `getTradesByDate`
- **Immutable updates only** - never mutate state directly
- **Keep stores focused** - one store per domain (trades, settings)

---

## TailwindCSS Styling Rules

### Color Usage
```
Backgrounds:      bg-[#0a0e1a]  bg-[#111827]
Glass cards:      bg-white/[0.05] backdrop-blur-xl border border-white/[0.08]
Gold accent:      text-[#f0b90b] bg-[#f0b90b]
Profit:           text-[#00c48c] bg-[#00c48c]/20
Loss:             text-[#ff4d6a] bg-[#ff4d6a]/20
Neutral:          text-gray-400 text-gray-500
Text primary:     text-gray-50
Text secondary:   text-gray-400
```

### Glassmorphism Card Pattern
```jsx
// Standard glass card
<div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6">

// Glass card with hover glow
<div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 
  hover:bg-white/[0.08] hover:border-[#f0b90b]/20 hover:shadow-lg hover:shadow-[#f0b90b]/5 
  transition-all duration-300">
```

### Spacing & Layout
- Use `gap-4` or `gap-6` for grid/flex gaps
- Page padding: `p-6` or `p-8`
- Card padding: `p-4` to `p-6`
- Border radius: `rounded-xl` for cards, `rounded-lg` for inputs, `rounded-full` for badges
- Max content width: `max-w-7xl mx-auto`

### Responsive Rules
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`
- Sidebar: fixed left, hidden on mobile with hamburger toggle
- Charts: full width on mobile, 2-col grid on desktop

### Forbidden
- **No inline styles** (`style={{}}`) - use Tailwind only
- **No custom CSS classes** except in `index.css` for animations
- **No `!important`**
- **No pixel values** - use Tailwind spacing scale

---

## Framer Motion Animation Guidelines

### Page Transitions
```jsx
// Wrap every page in PageTransition component
import PageTransition from '../components/ui/PageTransition';

export default function Dashboard() {
  return (
    <PageTransition>
      {/* page content */}
    </PageTransition>
  );
}

// PageTransition component:
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

export default function PageTransition({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
```

### Card Stagger Animation
```jsx
// Container
const containerVariants = {
  animate: {
    transition: { staggerChildren: 0.08 }
  }
};

// Individual card
const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { 
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

// Usage
<motion.div variants={containerVariants} initial="initial" animate="animate">
  {cards.map(card => (
    <motion.div key={card.id} variants={cardVariants}>
      <StatCard {...card} />
    </motion.div>
  ))}
</motion.div>
```

### Hover Effects
```jsx
// Subtle scale + glow
<motion.div
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
>
```

### Rules
- **Every page wrapped in PageTransition**
- **Stagger cards/list items** on initial render
- **Use `spring` for interactive elements** (buttons, cards)
- **Use `easeOut` for entrance animations**
- **Keep durations 0.2-0.5s** - never longer
- **No animations on frequently re-rendering elements** (live numbers, etc.)
- **Use `AnimatePresence`** for mount/unmount animations (modals, toasts)

---

## Recharts Guidelines

### Chart Wrapper Pattern
```jsx
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

// Always wrap in ResponsiveContainer
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <XAxis 
      dataKey="date" 
      stroke="#6b7280" 
      fontSize={12}
      tickLine={false}
      axisLine={false}
    />
    <YAxis 
      stroke="#6b7280" 
      fontSize={12}
      tickLine={false}
      axisLine={false}
      tickFormatter={(v) => `$${v}`}
    />
    <Tooltip 
      contentStyle={{ 
        backgroundColor: '#111827', 
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        color: '#f9fafb'
      }}
    />
    <Line 
      type="monotone" 
      dataKey="pnl" 
      stroke="#f0b90b" 
      strokeWidth={2}
      dot={false}
      activeDot={{ r: 6, fill: '#f0b90b' }}
    />
  </LineChart>
</ResponsiveContainer>
```

### Chart Colors
- Primary line/bar: `#f0b90b` (gold)
- Profit bars: `#00c48c` (green)
- Loss bars: `#ff4d6a` (red)
- Grid lines: `rgba(255,255,255,0.05)`
- Axis text: `#6b7280`
- Tooltip bg: `#111827`

### Rules
- **Always use ResponsiveContainer** - never fixed width
- **Always customize Tooltip** to match dark theme
- **Remove default axis lines** - use `axisLine={false}` and `tickLine={false}`
- **Add proper formatters** for currency values
- **Use smooth curves** - `type="monotone"` for line charts

---

## Trade Data Schema

```javascript
// Single trade object
{
  id: "uuid-string",         // crypto.randomUUID()
  pair: "BTC/USDT",          // Trading pair
  type: "long",              // "long" or "short"
  entryPrice: 45000.00,      // Entry price
  exitPrice: 46500.00,       // Exit price
  pnl: 150.00,              // Profit/Loss in USD (positive = profit, negative = loss)
  date: "2026-03-04",       // ISO date string (YYYY-MM-DD)
  time: "14:30",            // Time (HH:mm)
  notes: "Breakout trade",  // Optional notes
  createdAt: 1741234567890  // Unix timestamp
}
```

---

## Utility Functions Pattern

### formatters.js
```javascript
// Currency formatter
export function formatCurrency(value, currency = 'USD') {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(value);
}

// P&L with sign and color class
export function formatPnL(value) {
  const prefix = value >= 0 ? '+' : '';
  return `${prefix}${formatCurrency(value)}`;
}

// Percentage formatter
export function formatPercent(value) {
  const prefix = value >= 0 ? '+' : '';
  return `${prefix}${value.toFixed(2)}%`;
}
```

### calculations.js
```javascript
// Win rate
export function calcWinRate(trades) {
  if (trades.length === 0) return 0;
  const wins = trades.filter(t => t.pnl > 0).length;
  return (wins / trades.length) * 100;
}

// Best/worst day
export function calcBestDay(trades) {
  // Group by date, sum P&L per day, return max
}

// Monthly P&L
export function calcMonthlyPnL(trades, year, month) {
  // Filter trades by month, sum P&L
}
```

---

## File Organization Rules

1. **Components in correct subfolder:**
   - `components/layout/` - Sidebar, Header, AnimatedBackground
   - `components/ui/` - GlassCard, StatCard, PnLBadge, ConfirmModal, PageTransition
   - `components/trade/` - TradeForm, TradeTable
   - `components/charts/` - All Recharts wrappers

2. **Pages are route-level only** - no business logic in pages, delegate to components

3. **Stores are flat** - no nested store files

4. **Utils are pure functions** - no side effects, no state

---

## Import Order
Always maintain this import order with blank lines between groups:

```jsx
// 1. React
import { useState, useMemo, useCallback } from 'react';

// 2. Third-party libraries
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react';

// 3. Stores
import { useTradeStore } from '../stores/useTradeStore';

// 4. Components
import GlassCard from '../components/ui/GlassCard';
import StatCard from '../components/ui/StatCard';

// 5. Utils
import { formatCurrency, formatPnL } from '../utils/formatters';
import { calcWinRate } from '../utils/calculations';
```

---

## Do's and Don'ts

### DO
- Use semantic HTML (`<nav>`, `<main>`, `<section>`, `<article>`)
- Add `aria-label` to interactive elements
- Use `key` prop correctly on list items (use `trade.id`, not array index)
- Handle empty states gracefully ("No trades yet" with illustration)
- Add loading states for async operations
- Use `motion.div` for animated containers
- Keep the P&L calendar as the hero feature - make it pixel-perfect

### DON'T
- Don't use `any` types or TypeScript
- Don't use class components
- Don't use Redux or Context API (use Zustand)
- Don't add a backend or API calls
- Don't use CSS modules or styled-components (use Tailwind)
- Don't use `index` as `key` in lists
- Don't leave console.log statements
- Don't hardcode colors - always use the palette from PLAN.md
- Don't make API calls - everything is localStorage
