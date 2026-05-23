import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Camera } from '@/types/index';

interface CameraState {
  cameras: Camera[];
  selectedCamera: Camera | null;
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  pageSize: number;
}

const initialState: CameraState = {
  cameras: [],
  selectedCamera: null,
  loading: false,
  error: null,
  total: 0,
  currentPage: 1,
  pageSize: 20,
};

const cameraSlice = createSlice({
  name: 'cameras',
  initialState,
  reducers: {
    // Fetch actions
    fetchCamerasStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCamerasSuccess: (state, action: PayloadAction<{ cameras: Camera[]; total: number }>) => {
      state.loading = false;
      state.cameras = action.payload.cameras;
      state.total = action.payload.total;
    },
    fetchCamerasError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Select camera
    selectCamera: (state, action: PayloadAction<Camera | null>) => {
      state.selectedCamera = action.payload;
    },

    // Create camera
    createCameraStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createCameraSuccess: (state, action: PayloadAction<Camera>) => {
      state.loading = false;
      state.cameras.push(action.payload);
      state.total += 1;
    },
    createCameraError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update camera
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
      if (state.selectedCamera?.id === action.payload.id) {
        state.selectedCamera = action.payload;
      }
    },
    updateCameraError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete camera
    deleteCameraStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteCameraSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.cameras = state.cameras.filter((c) => c.id !== action.payload);
      state.total -= 1;
      if (state.selectedCamera?.id === action.payload) {
        state.selectedCamera = null;
      }
    },
    deleteCameraError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Pagination
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.currentPage = 1;
    },
  },
});

export const {
  fetchCamerasStart,
  fetchCamerasSuccess,
  fetchCamerasError,
  selectCamera,
  createCameraStart,
  createCameraSuccess,
  createCameraError,
  updateCameraStart,
  updateCameraSuccess,
  updateCameraError,
  deleteCameraStart,
  deleteCameraSuccess,
  deleteCameraError,
  setCurrentPage,
  setPageSize,
} = cameraSlice.actions;

export default cameraSlice.reducer;
