import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import { encryptTransform } from "redux-persist-transform-encrypt";
import { baseApi } from "./api/baseApi";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";

// Next.js automatically loads .env files, just use process.env directly
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "your-secret-encryption-key-change-in-production-min-32-chars";

// Create sessionStorage adapter for redux-persist
// This will use sessionStorage instead of localStorage
const createSessionStorage = () => {
  if (typeof window === "undefined") {
    // Server-side: return noop storage
    return {
      getItem(_key: string) {
        return Promise.resolve(null);
      },
      setItem(_key: string, value: any) {
        return Promise.resolve(value);
      },
      removeItem(_key: string) {
        return Promise.resolve();
      },
    };
  }

  // Client-side: use sessionStorage
  return {
    getItem(key: string): Promise<string | null> {
      return Promise.resolve(sessionStorage.getItem(key));
    },
    setItem(key: string, value: string): Promise<void> {
      return Promise.resolve(sessionStorage.setItem(key, value));
    },
    removeItem(key: string): Promise<void> {
      return Promise.resolve(sessionStorage.removeItem(key));
    },
  };
};

const storage = createSessionStorage();

// Persist configuration for auth (with encryption for user data)
// Note: Tokens are stored in httpOnly cookies by backend, not in Redux
// Using sessionStorage - data persists only for the browser session
const authPersistConfig = {
  key: "auth",
  storage,
  transforms: [
    encryptTransform({
      secretKey: ENCRYPTION_KEY,
      onError: (error) => {
        console.error("Encryption error:", error);
      },
    }),
  ],
  // Persist user data and isAuthenticated flag
  // Tokens are stored in httpOnly cookies by backend, not in Redux
  whitelist: ["user", "isAuthenticated"],
};

// Persist configuration for cart (no encryption needed)
// Using sessionStorage - cart data persists only for the browser session
const cartPersistConfig = {
  key: "cart",
  storage,
  // Only persist items, not isOpen (UI state)
  whitelist: ["items"],
};

// Root reducer with persisted slices
const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: persistReducer(authPersistConfig, authReducer),
  cart: persistReducer(cartPersistConfig, cartReducer),
});

export const makeStore = () => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(baseApi.middleware),
  });

  return store;
};

export const makePersistor = (store: ReturnType<typeof makeStore>) => {
  return persistStore(store);
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
