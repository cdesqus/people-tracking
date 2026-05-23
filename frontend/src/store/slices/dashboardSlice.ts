/**
 * Dashboard Redux Slice
 * Manages dashboard-specific state like KPIs, connection status, etc.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DashboardKPIs } from '@types/dashboard';

interface DashboardState {
  kpis: DashboardKPIs;
  wsConnected: boolean;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  autoRefreshEnabled: boolean;
  refreshInterval: number; // ms
}

const initialState: DashboardState = {
  kpis: {
    occupancy: 0,
    activeCameras: 0,
    activeCamerasTotal: 0,
    activeAlerts: 0,
    currentVisitors: 0,
    timestamp: new Date().toISOString(),
  },
  wsConnected: false,
  loading: false,
  error: null,
  lastUpdated: null,
  autoRefreshEnabled: true,
  refreshInterval: 5000, // 5 seconds
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // Update KPIs
    updateKPIs: (state, action: PayloadAction<Partial<DashboardKPIs>>) => {
      state.kpis = {
        ...state.kpis,
        ...action.payload,
        timestamp: new Date().toISOString(),
      };
      state.lastUpdated = new Date().toISOString();
      state.error = null;
    },

    // WebSocket connection status
    wsConnecting: (state) => {
      state.wsConnected = false;
      state.loading = true;
    },

    wsConnected: (state) => {
      state.wsConnected = true;
      state.loading = false;
      state.error = null;
    },

    wsDisconnected: (state) => {
      state.wsConnected = false;
      state.loading = false;
    },

    wsError: (state, action: PayloadAction<string>) => {
      state.wsConnected = false;
      state.error = action.payload;
    },

    // Auto refresh settings
    setAutoRefresh: (state, action: PayloadAction<boolean>) => {
      state.autoRefreshEnabled = action.payload;
    },

    setRefreshInterval: (state, action: PayloadAction<number>) => {
      state.refreshInterval = action.payload;
    },

    // General error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Reset dashboard
    reset: () => initialState,
  },
});

export const {
  updateKPIs,
  wsConnecting,
  wsConnected,
  wsDisconnected,
  wsError,
  setAutoRefresh,
  setRefreshInterval,
  setError,
  clearError,
  reset,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
