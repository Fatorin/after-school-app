import { Me } from '@/types/me';
import { create } from 'zustand';

interface AuthStore {
  me: Me | null;
  loading: boolean;
  setMe: (me: Me | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  me: null,
  loading: true,
  setMe: (me) => set({ me }),
  setLoading: (loading) => set({ loading }),
}));