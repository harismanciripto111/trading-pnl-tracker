# Trading P&L Tracker

A sleek, interactive Trading Profit & Loss Tracker built with React.js. Track daily P&L in a beautiful calendar format, log trades, and analyze performance with interactive charts.

## Features

- **Dashboard** — Portfolio overview with stat cards, equity curve, and recent trades
- **P&L Calendar** — Monthly calendar with color-coded daily P&L (green = profit, red = loss)
- **Trade Logger** — Add, edit, delete trades with pair, type, entry/exit price, and notes
- **Analytics** — 6 interactive charts: Equity Curve, Daily P&L, Win/Loss Donut, Drawdown, Weekday Heatmap, Monthly Performance
- **Settings** — Export/import JSON backup, currency toggle (USD/IDR/EUR/USDT), clear data

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 + Vite 5 | UI framework + build tool |
| TailwindCSS 3 | Utility-first styling |
| Framer Motion 11 | Animations & page transitions |
| Recharts 2 | Interactive data visualizations |
| Zustand 4 | Lightweight state management |
| React Router 6 | SPA navigation |
| Lucide React | Icon library |
| date-fns 3 | Date utilities |

## Design

- **Dark theme** with deep navy background (#0a0e1a)
- **Glassmorphism** cards with backdrop blur
- **Animated gradient mesh** background
- **Color palette**: Gold (#f0b90b), Emerald (#00c48c), Ruby (#ff4d6a)
- **Inter** font family
- Smooth Framer Motion transitions throughout

## Quick Start

```bash
# Clone the repo
git clone https://github.com/harismanciripto111/trading-pnl-tracker.git
cd trading-pnl-tracker

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## VPS Deployment

```bash
# Build
npm run build

# Copy dist to nginx
sudo mkdir -p /var/www/trading-pnl-tracker
sudo cp -r dist/* /var/www/trading-pnl-tracker/
```

Nginx config:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/trading-pnl-tracker/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
}
```

## Project Structure

```
src/
  components/
    layout/      # Sidebar, Header, AnimatedBackground
    ui/          # GlassCard, StatCard, PnLBadge, ConfirmModal, PageTransition
    trade/       # TradeForm, TradeTable
    charts/      # EquityCurve, DailyPnL, WinLossDonut, Drawdown, WeekdayHeatmap, MonthlyBar
  pages/         # Dashboard, Calendar, Trades, Analytics, Settings
  stores/        # useTradeStore, useSettingsStore (Zustand + localStorage)
  utils/         # formatters, calculations, sampleData
```

## Data Storage

All data is stored in browser **localStorage** — no backend, no database, no data sent to any server. Use the export/import feature in Settings to backup or transfer your data.

## License

MIT
