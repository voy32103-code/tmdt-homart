import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('homemart_admin_token') || '',

  setToken: (token) => {
    if (token) {
      localStorage.setItem('homemart_admin_token', token);
    } else {
      localStorage.removeItem('homemart_admin_token');
    }
    set({ token });
  },

  logout: () => {
    localStorage.removeItem('homemart_admin_token');
    set({ token: '' });
  }
}));
