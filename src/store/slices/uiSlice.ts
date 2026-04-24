import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UIState, Notification } from '@/types';

const initialState: UIState = {
  isDarkMode: false,
  isMenuOpen: false,
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setDarkMode: (state: UIState, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    toggleDarkMode: (state: UIState) => {
      state.isDarkMode = !state.isDarkMode;
    },
    setMenuOpen: (state: UIState, action: PayloadAction<boolean>) => {
      state.isMenuOpen = action.payload;
    },
    toggleMenu: (state: UIState) => {
      state.isMenuOpen = !state.isMenuOpen;
    },
    addNotification: (state: UIState, action: PayloadAction<Notification>) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state: UIState, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n: Notification) => n.id !== action.payload);
    },
    clearNotifications: (state: UIState) => {
      state.notifications = [];
    },
  },
});

export const uiActions = uiSlice.actions;
export default uiSlice.reducer;
