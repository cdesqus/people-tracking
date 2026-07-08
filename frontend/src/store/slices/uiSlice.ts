import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light';
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  showNotification: {
    visible: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  };
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: 'light',
  notificationsEnabled: true,
  soundEnabled: true,
  showNotification: {
    visible: false,
    type: 'info',
    message: '',
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },

    setTheme: (state, _action: PayloadAction<'light' | 'dark'>) => {
      state.theme = 'light';
    },

    toggleTheme: (state) => {
      state.theme = 'light';
    },

    setNotificationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.notificationsEnabled = action.payload;
    },

    setSoundEnabled: (state, action: PayloadAction<boolean>) => {
      state.soundEnabled = action.payload;
    },

    showNotification: (
      state,
      action: PayloadAction<{
        type: 'success' | 'error' | 'warning' | 'info';
        message: string;
      }>
    ) => {
      state.showNotification = {
        visible: true,
        type: action.payload.type,
        message: action.payload.message,
      };
    },

    hideNotification: (state) => {
      state.showNotification.visible = false;
    },

    clearNotification: (state) => {
      state.showNotification = {
        visible: false,
        type: 'info',
        message: '',
      };
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  toggleTheme,
  setNotificationsEnabled,
  setSoundEnabled,
  showNotification,
  hideNotification,
  clearNotification,
} = uiSlice.actions;

export default uiSlice.reducer;
