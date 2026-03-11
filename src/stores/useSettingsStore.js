import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      // ==================== STATE ====================
      currency: 'USD',
      sidebarOpen: true,
      mobileSidebarOpen: false,

      // Available currencies
      currencies: [
        { code: 'USD', symbol: '$', name: 'US Dollar' },
        { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
        { code: 'EUR', symbol: '\u20ac', name: 'Euro' },
        { code: 'GBP', symbol: '\u00a3', name: 'British Pound' },
        { code: 'USDT', symbol: 'USDT', name: 'Tether' },
      ],

      // ==================== ACTIONS ====================
      setCurrency: (currency) => set({ currency }),

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      toggleMobileSidebar: () =>
        set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),

      closeMobileSidebar: () => set({ mobileSidebarOpen: false }),

      // ==================== GETTERS ====================
      getCurrencySymbol: () => {
        const { currency, currencies } = get();
        const found = currencies.find((c) => c.code === currency);
        return found ? found.symbol : '$';
      },
    }),
    {
      name: 'trading-pnl-settings',
      partialize: (state) => ({
        currency: state.currency,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
