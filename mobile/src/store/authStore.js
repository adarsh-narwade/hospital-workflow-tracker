import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { authAPI } from "../services/api";

export const useAuthStore = create((set) => ({
  user:    null,
  token:   null,
  loading: false,
  error:   null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.login({ email, password });
      await SecureStore.setItemAsync("jwt", data.token);
      set({ user: data.user, token: data.token, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync("jwt");
    set({ user: null, token: null });
  },

  loadUser: async () => {
    try {
      const token = await SecureStore.getItemAsync("jwt");
      if (!token) return;
      const { data } = await authAPI.me();
      set({ user: data.user, token });
    } catch {
      await SecureStore.deleteItemAsync("jwt");
    }
  },
}));