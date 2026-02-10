import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User, UserProfile } from '@/types';

const initialState: AuthState = {
  user: null,
  profile: null,
  isLoggedIn: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state: AuthState, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isLoggedIn = !!action.payload;
    },
    setProfile: (state: AuthState, action: PayloadAction<UserProfile | null>) => {
      state.profile = action.payload;
    },
    setLoading: (state: AuthState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state: AuthState, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    logout: (state: AuthState) => {
      state.user = null;
      state.profile = null;
      state.isLoggedIn = false;
      state.error = null;
    },
    clearError: (state: AuthState) => {
      state.error = null;
    },
  },
});

export const authActions = authSlice.actions;
export default authSlice.reducer;
