import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Role } from "@/lib/constants";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      
      // Store in localStorage (future: use cookies)
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", action.payload.token);
        localStorage.setItem("user_data", JSON.stringify(action.payload.user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
      }
    },
    initializeAuth: (state) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("auth_token");
        const userData = localStorage.getItem("user_data");
        
        if (token && userData) {
          try {
            state.user = JSON.parse(userData);
            state.token = token;
            state.isAuthenticated = true;
          } catch (error) {
            // Invalid data, clear it
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_data");
          }
        }
      }
    },
  },
});

export const { setCredentials, logout, initializeAuth } = authSlice.actions;
export default authSlice.reducer;

