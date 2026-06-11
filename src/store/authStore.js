import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user:  null,
      token: null,

      login: (user, token) => set({ user, token }),
      logout: () => {
        localStorage.removeItem('fgcl_token');
        localStorage.removeItem('fgcl_user');
        set({ user: null, token: null });
      },

      isAdmin:      () => useAuthStore.getState().user?.role === 'admin',
      isCommercial: () => useAuthStore.getState().user?.role === 'commercial',
      isTechnicien: () => useAuthStore.getState().user?.role === 'technicien',
    }),
    {
      name: 'fgcl-auth',
      getStorage: () => localStorage,
    }
  )
);

export default useAuthStore;