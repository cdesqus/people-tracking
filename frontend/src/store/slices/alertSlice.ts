import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Alert } from '@types/index';

interface AlertState {
  alerts: Alert[];
  selectedAlert: Alert | null;
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  pageSize: number;
  filter: {
    type?: string;
    severity?: string;
    cameraId?: string;
  };
}

const initialState: AlertState = {
  alerts: [],
  selectedAlert: null,
  loading: false,
  error: null,
  total: 0,
  currentPage: 1,
  pageSize: 20,
  filter: {},
};

const alertSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    // Fetch alerts
    fetchAlertsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAlertsSuccess: (state, action: PayloadAction<{ alerts: Alert[]; total: number }>) => {
      state.loading = false;
      state.alerts = action.payload.alerts;
      state.total = action.payload.total;
    },
    fetchAlertsError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Select alert
    selectAlert: (state, action: PayloadAction<Alert | null>) => {
      state.selectedAlert = action.payload;
    },

    // Acknowledge alert
    acknowledgeAlertStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    acknowledgeAlertSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      const index = state.alerts.findIndex((a) => a.id === action.payload);
      if (index !== -1) {
        state.alerts[index].acknowledged = true;
      }
      if (state.selectedAlert?.id === action.payload) {
        state.selectedAlert.acknowledged = true;
      }
    },
    acknowledgeAlertError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete alert
    deleteAlertStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteAlertSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.alerts = state.alerts.filter((a) => a.id !== action.payload);
      state.total -= 1;
      if (state.selectedAlert?.id === action.payload) {
        state.selectedAlert = null;
      }
    },
    deleteAlertError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Add new alert (real-time)
    addAlert: (state, action: PayloadAction<Alert>) => {
      state.alerts.unshift(action.payload);
      state.total += 1;
    },

    // Filter alerts
    setFilter: (state, action: PayloadAction<AlertState['filter']>) => {
      state.filter = action.payload;
      state.currentPage = 1;
    },

    // Pagination
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.currentPage = 1;
    },

    // Clear alerts
    clearAlerts: (state) => {
      state.alerts = [];
      state.total = 0;
      state.selectedAlert = null;
    },
  },
});

export const {
  fetchAlertsStart,
  fetchAlertsSuccess,
  fetchAlertsError,
  selectAlert,
  acknowledgeAlertStart,
  acknowledgeAlertSuccess,
  acknowledgeAlertError,
  deleteAlertStart,
  deleteAlertSuccess,
  deleteAlertError,
  addAlert,
  setFilter,
  setCurrentPage,
  setPageSize,
  clearAlerts,
} = alertSlice.actions;

export default alertSlice.reducer;
