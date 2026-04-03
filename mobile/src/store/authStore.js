import { create } from "zustand";
import { authAPI } from "../services/api";
import { tokenStorage } from "../services/tokenStorage";

export const useAuthStore = create((set) => ({
  user:    null,
  token:   null,
  loading: false,
  error:   null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.login({ email, password });
      await tokenStorage.set(data.token);
      set({ user: data.user, token: data.token, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  logout: async () => {
    await tokenStorage.remove();
    set({ user: null, token: null });
  },

  loadUser: async () => {
    try {
      const token = await tokenStorage.get();
      if (!token) return;
      const { data } = await authAPI.me();
      set({ user: data.user, token });
    } catch {
      await tokenStorage.remove();
    }
  },
}));
