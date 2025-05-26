import { create } from 'zustand';
import { CatalogState, Product } from '@/types';
import { catalogService } from '@/lib/db/catalog';

export const useCatalogStore = create<CatalogState>((set, get) => ({
  products: [],
  isLoading: false,
  lastSync: null,

  searchProducts: (query: string, language: string): Product[] => {
    // This is synchronous for now, but in a real app might be async
    const state = get();
    if (state.products.length === 0) {
      return [];
    }
    
    // For now, return empty array - the actual search happens through the service
    return [];
  },

  syncCatalog: async () => {
    set({ isLoading: true });
    try {
      await catalogService.initialize();
      await catalogService.syncCatalog();
      set({ lastSync: new Date(), isLoading: false });
    } catch (error) {
      console.error('Failed to sync catalog:', error);
      set({ isLoading: false });
    }
  },
}));