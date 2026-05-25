import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types/index';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },

    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setUser, setAuthLoading, setAuthError, logout, clearError } =
  authSlice.actions;

export default authSlice.reducer;
