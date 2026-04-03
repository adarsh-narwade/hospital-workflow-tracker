import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "jwt";

const isWeb = Platform.OS === "web";

const getWebStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
};

export const tokenStorage = {
  async get() {
    if (isWeb) {
      return getWebStorage()?.getItem(TOKEN_KEY) ?? null;
    }

    return SecureStore.getItemAsync(TOKEN_KEY);
  },

  async set(value) {
    if (isWeb) {
      getWebStorage()?.setItem(TOKEN_KEY, value);
      return;
    }

    await SecureStore.setItemAsync(TOKEN_KEY, value);
  },

  async remove() {
    if (isWeb) {
      getWebStorage()?.removeItem(TOKEN_KEY);
      return;
    }

    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};
