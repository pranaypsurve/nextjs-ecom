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
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      // Tokens are stored in httpOnly cookies by backend
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      // Backend will clear cookies on logout
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;

