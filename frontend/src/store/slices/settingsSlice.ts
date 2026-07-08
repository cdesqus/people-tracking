import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: 'admin' | 'manager' | 'operator' | 'security' | 'receptionist' | 'viewer';
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Camera {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  type: string;
  resolution?: string;
  fps?: number;
}

export interface SystemSettings {
  alertRules: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    slackEnabled: boolean;
  };
  thresholds: {
    confidenceThreshold: number;
    detectionSensitivity: number;
  };
  camera: {
    checkInterval: number;
    obstructionDarkMeanThreshold: number;
    obstructionFlatStddevThreshold: number;
    obstructionConsecutiveFrames: number;
  };
  dataRetention: {
    faceImageDays: number;
    detectionLogDays: number;
    videoArchiveDays: number;
    autoDelete: boolean;
  };
  notifications: {
    emailEnabled: boolean;
    notificationTypes: {
      alerts: boolean;
      dailyReport: boolean;
      weeklySummary: boolean;
    };
    slackWebhookUrl?: string;
    smsGatewayConfig?: {
      provider: string;
      apiKey?: string;
    };
  };
}

export interface SystemHealth {
  database: 'connected' | 'error';
  redis: 'connected' | 'error';
  rekognition: 'connected' | 'error';
  lastBackup: string;
  diskUsagePercent: number;
}

interface SettingsState {
  systemSettings: SystemSettings;
  users: User[];
  cameras: Camera[];
  health: SystemHealth;
  loading: boolean;
  error: string | null;
  success: string | null;
  showUserModal: boolean;
  selectedUser: User | null;
  showCameraModal: boolean;
  selectedCamera: Camera | null;
}

const initialState: SettingsState = {
  systemSettings: {
    alertRules: {
      emailEnabled: true,
      smsEnabled: false,
      slackEnabled: false,
    },
    thresholds: {
      confidenceThreshold: 80,
      detectionSensitivity: 75,
    },
    camera: {
      checkInterval: 30,
      obstructionDarkMeanThreshold: 20,
      obstructionFlatStddevThreshold: 10,
      obstructionConsecutiveFrames: 8,
    },
    dataRetention: {
      faceImageDays: 90,
      detectionLogDays: 180,
      videoArchiveDays: 30,
      autoDelete: true,
    },
    notifications: {
      emailEnabled: true,
      notificationTypes: {
        alerts: true,
        dailyReport: false,
        weeklySummary: true,
      },
      slackWebhookUrl: '',
      smsGatewayConfig: {
        provider: '',
        apiKey: '',
      },
    },
  },
  users: [],
  cameras: [],
  health: {
    database: 'connected',
    redis: 'connected',
    rekognition: 'connected',
    lastBackup: new Date().toISOString(),
    diskUsagePercent: 45,
  },
  loading: false,
  error: null,
  success: null,
  showUserModal: false,
  selectedUser: null,
  showCameraModal: false,
  selectedCamera: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    // System Settings
    fetchSettingsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSettingsSuccess: (state, action: PayloadAction<SystemSettings>) => {
      state.loading = false;
      state.systemSettings = action.payload;
    },
    fetchSettingsError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateSettingsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateSettingsSuccess: (state, action: PayloadAction<SystemSettings>) => {
      state.loading = false;
      state.systemSettings = action.payload;
      state.success = 'Settings updated successfully';
    },
    updateSettingsError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    // Users
    fetchUsersStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchUsersSuccess: (state, action: PayloadAction<User[]>) => {
      state.loading = false;
      state.users = action.payload;
    },
    fetchUsersError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    createUserStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createUserSuccess: (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.users.push(action.payload);
      state.success = 'User created successfully';
    },
    createUserError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateUserStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateUserSuccess: (state, action: PayloadAction<User>) => {
      state.loading = false;
      const index = state.users.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
      state.success = 'User updated successfully';
    },
    updateUserError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteUserStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteUserSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.users = state.users.filter((u) => u.id !== action.payload);
      state.success = 'User deleted successfully';
    },
    deleteUserError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    setShowUserModal: (state, action: PayloadAction<boolean>) => {
      state.showUserModal = action.payload;
    },
    // Cameras
    fetchCamerasStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCamerasSuccess: (state, action: PayloadAction<Camera[]>) => {
      state.loading = false;
      state.cameras = action.payload;
    },
    fetchCamerasError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    createCameraStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createCameraSuccess: (state, action: PayloadAction<Camera>) => {
      state.loading = false;
      state.cameras.push(action.payload);
      state.success = 'Camera added successfully';
    },
    createCameraError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateCameraStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateCameraSuccess: (state, action: PayloadAction<Camera>) => {
      state.loading = false;
      const index = state.cameras.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.cameras[index] = action.payload;
      }
      state.success = 'Camera updated successfully';
    },
    updateCameraError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteCameraStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteCameraSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.cameras = state.cameras.filter((c) => c.id !== action.payload);
      state.success = 'Camera deleted successfully';
    },
    deleteCameraError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSelectedCamera: (state, action: PayloadAction<Camera | null>) => {
      state.selectedCamera = action.payload;
    },
    setShowCameraModal: (state, action: PayloadAction<boolean>) => {
      state.showCameraModal = action.payload;
    },
    // Health
    fetchHealthStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchHealthSuccess: (state, action: PayloadAction<SystemHealth>) => {
      state.loading = false;
      state.health = action.payload;
    },
    fetchHealthError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    // UI
    clearSuccess: (state) => {
      state.success = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchSettingsStart,
  fetchSettingsSuccess,
  fetchSettingsError,
  updateSettingsStart,
  updateSettingsSuccess,
  updateSettingsError,
  fetchUsersStart,
  fetchUsersSuccess,
  fetchUsersError,
  createUserStart,
  createUserSuccess,
  createUserError,
  updateUserStart,
  updateUserSuccess,
  updateUserError,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserError,
  setSelectedUser,
  setShowUserModal,
  fetchCamerasStart,
  fetchCamerasSuccess,
  fetchCamerasError,
  createCameraStart,
  createCameraSuccess,
  createCameraError,
  updateCameraStart,
  updateCameraSuccess,
  updateCameraError,
  deleteCameraStart,
  deleteCameraSuccess,
  deleteCameraError,
  setSelectedCamera,
  setShowCameraModal,
  fetchHealthStart,
  fetchHealthSuccess,
  fetchHealthError,
  clearSuccess,
  clearError,
} = settingsSlice.actions;

export default settingsSlice.reducer;
