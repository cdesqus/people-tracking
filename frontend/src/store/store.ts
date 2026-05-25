import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import cameraReducer from './slices/cameraSlice';
import faceReducer from './slices/faceSlice';
import alertReducer from './slices/alertSlice';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import employeeReducer from './slices/employeeSlice';
import visitorReducer from './slices/visitorSlice';
import reportReducer from './slices/reportSlice';
import settingsReducer from './slices/settingsSlice';
import branchReducer from './slices/branchSlice';

export const store = configureStore({
  reducer: {
    cameras: cameraReducer,
    faces: faceReducer,
    alerts: alertReducer,
    ui: uiReducer,
    auth: authReducer,
    dashboard: dashboardReducer,
    employees: employeeReducer,
    visitors: visitorReducer,
    reports: reportReducer,
    settings: settingsReducer,
    branches: branchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
