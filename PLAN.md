# Trading P&L Tracker - Project Plan

## Overview
A sleek, interactive Trading Profit & Loss Tracker web application built with React.js. Designed for crypto/stock traders who want to visualize their daily P&L in a beautiful calendar format, log trades, and analyze performance with interactive charts. Runs locally on a VPS with zero backend dependency — all data persists in localStorage.

---

## Tech Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|----------|
| Framework | React | 18.x | UI library |
| Build Tool | Vite | 5.x | Fast dev server & bundler |
| Styling | TailwindCSS | 3.x | Utility-first CSS |
| Animations | Framer Motion | 11.x | Page transitions, enter/exit animations |
| Charts | Recharts | 2.x | Interactive data visualizations |
| State | Zustand | 4.x | Lightweight state management |
| Routing | React Router DOM | 6.x | SPA navigation |
| Icons | Lucide React | 0.x | Beautiful consistent icons |
| Particles | @tsparticles/react | 3.x | Floating particle background effects |
| Date Utils | date-fns | 3.x | Date manipulation & formatting |

---

## Color Palette

```
Primary Background:   #0a0e1a  (Deep Navy / Midnight)
Secondary Background: #111827  (Dark Charcoal)
Card Background:      rgba(17, 24, 39, 0.6) + backdrop-blur (Glassmorphism)
Card Border:          rgba(255, 255, 255, 0.08)

Accent Gold:          #f0b90b  (Binance Gold - primary accent)
Accent Gold Hover:    #f5d245

Profit Green:         #00c48c  (Emerald)
Profit Green Glow:    rgba(0, 196, 140, 0.2)

Loss Red:             #ff4d6a  (Ruby)
Loss Red Glow:        rgba(255, 77, 106, 0.2)

Neutral / No Trade:   #4b5563  (Slate Gray)
Text Primary:         #f9fafb  (Almost White)
Text Secondary:       #9ca3af  (Muted Gray)
Text Muted:           #6b7280  (Dim Gray)

Gradient Mesh BG:     #0a0e1a -> #1a1033 -> #0d1f2d -> #0a0e1a (animated shift)
```

---

## Features

### 1. Dashboard (Home)
- Portfolio overview with glassmorphism stat cards
- Total P&L (all-time), Monthly P&L, Win Rate %, Total Trades
- Best Day & Worst Day highlights
- Mini equity curve chart (last 30 days)
- Recent trades list (last 5)
- All cards animate in with Framer Motion stagger effect

### 2. P&L Calendar
- Monthly calendar grid (Sun-Sat) — inspired by the reference screenshot
- Each day cell shows P&L amount with color coding:
  - Green cell = profit day
  - Red cell = loss day  
  - Gray/empty = no trade
- Monthly P&L total + ROI % displayed in header
- Click on a day to see trade details for that date
- Navigate between months (prev/next arrows)
- Smooth hover effects on day cells

### 3. Trade Logger
- Add new trade form:
  - Trading pair (e.g., BTC/USDT, ETH/USDT)
  - Trade type: Long / Short
  - Entry price
  - Exit price
  - P&L amount (auto-calculated or manual)
  - Date & time
  - Notes (optional)
- Trade history table:
  - Sortable by date, pair, P&L
  - Filterable by pair, date range, profit/loss
  - Edit & delete trades
  - Alternating row colors for readability

### 4. Analytics
- **Equity Curve** — Line chart showing cumulative P&L over time
- **Daily P&L** — Bar chart (green bars up, red bars down)
- **Win/Loss Ratio** — Donut chart with percentage
- **Drawdown Chart** — Area chart showing max drawdown periods
- **Profit by Day of Week** — Heatmap showing which days you trade best
- **Monthly Performance** — Bar chart comparing monthly P&L
- All charts interactive with tooltips and hover effects

### 5. Settings
- Export data as JSON file (backup)
- Import data from JSON file (restore)
- Currency display toggle (USD / IDR / EUR)
- Clear all data with confirmation modal
- App version & about info

---

## Folder Structure

```
trading-pnl-tracker/
|-- public/
|   |-- favicon.svg
|-- src/
|   |-- assets/
|   |-- components/
|   |   |-- layout/
|   |   |   |-- Sidebar.jsx
|   |   |   |-- Header.jsx
|   |   |   |-- AnimatedBackground.jsx
|   |   |-- ui/
|   |   |   |-- GlassCard.jsx
|   |   |   |-- StatCard.jsx
|   |   |   |-- PnLBadge.jsx
|   |   |   |-- ConfirmModal.jsx
|   |   |   |-- PageTransition.jsx
|   |   |-- trade/
|   |   |   |-- TradeForm.jsx
|   |   |   |-- TradeTable.jsx
|   |   |-- charts/
|   |       |-- EquityCurve.jsx
|   |       |-- DailyPnLChart.jsx
|   |       |-- WinLossDonut.jsx
|   |       |-- DrawdownChart.jsx
|   |       |-- WeekdayHeatmap.jsx
|   |       |-- MonthlyBarChart.jsx
|   |-- pages/
|   |   |-- Dashboard.jsx
|   |   |-- Calendar.jsx
|   |   |-- Trades.jsx
|   |   |-- Analytics.jsx
|   |   |-- Settings.jsx
|   |-- stores/
|   |   |-- useTradeStore.js
|   |   |-- useSettingsStore.js
|   |-- utils/
|   |   |-- calculations.js
|   |   |-- formatters.js
|   |   |-- sampleData.js
|   |-- App.jsx
|   |-- main.jsx
|   |-- index.css
|-- PLAN.md
|-- AGENT.md
|-- README.md
|-- package.json
|-- vite.config.js
|-- tailwind.config.js
|-- postcss.config.js
|-- .gitignore
```

---

## Design Philosophy

### Animated Background
- Multi-color gradient mesh that slowly shifts and animates (CSS @keyframes)
- Floating particle dots using tsparticles (low opacity, slow drift)
- Creates a "living" feel without being distracting

### Glassmorphism
- All cards use `backdrop-blur-xl` + semi-transparent backgrounds
- Subtle border with `border-white/[0.08]`
- Soft shadow glow on hover
- Creates depth and elegance

### Animations (Framer Motion)
- Page transitions: fade + slide up (200ms)
- Card entrance: stagger effect (each card delays 50ms)
- Number counters: animate from 0 to value on page load
- Hover: slight scale(1.02) + glow effect on interactive elements
- Calendar cells: subtle pop on hover

### Typography
- Font: Inter (Google Fonts) — clean, modern, highly readable
- Headings: font-bold, tracking-tight
- Numbers/Money: font-mono for alignment

---

## VPS Deployment Guide

### Prerequisites
- Node.js 18+ installed
- Nginx installed
- Domain (optional) or direct IP access

### Build & Deploy

```bash
# 1. Clone the repo
git clone https://github.com/harismanciripto111/trading-pnl-tracker.git
cd trading-pnl-tracker

# 2. Install dependencies
npm install

# 3. Build for production
npm run build

# 4. The build output is in /dist folder
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;  # or your VPS IP

    root /var/www/trading-pnl-tracker/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
}
```

```bash
# 5. Copy build to nginx
sudo mkdir -p /var/www/trading-pnl-tracker
sudo cp -r dist/* /var/www/trading-pnl-tracker/

# 6. Enable site & restart nginx
sudo ln -s /etc/nginx/sites-available/trading-pnl-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Auto-Update Script (optional)

```bash
#!/bin/bash
# update.sh - Run to pull latest changes and rebuild
cd /path/to/trading-pnl-tracker
git pull origin main
npm install
npm run build
sudo cp -r dist/* /var/www/trading-pnl-tracker/
echo "Updated and deployed!"
```

---

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Notes
- All data stored in browser localStorage (no database needed)
- Export/Import feature allows backup and transfer between devices
- Designed for single-user use (personal tracker)
- Responsive: works on desktop and tablet
- No authentication required (local use only)
