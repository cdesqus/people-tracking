import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@store/store';
import { setUser, logout, setAuthLoading } from '@store/slices/authSlice';
import { Loader } from 'lucide-react';

import Layout from '@components/layout/Layout';
import ProtectedRoute from '@components/ProtectedRoute';
import Dashboard from '@pages/Dashboard';
import Cameras from '@pages/Cameras';
import Alerts from '@pages/Alerts';
import Analytics from '@pages/Analytics';
import Settings from '@pages/SettingsPage';
import Employees from '@pages/Employees';
import Visitors from '@pages/Visitors';
import NotFound from '@pages/NotFound';
import Branches from '@pages/Branches';
import ReportsPage from '@pages/ReportsPage';
import Login from '@pages/Login';
import Unauthorized from '@pages/Unauthorized';
import apiClient from '@services/api';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading: authLoading } = useAppSelector((state) => state.auth);
  const [initializing, setInitializing] = useState(true);

  // Restore user session if token exists
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        dispatch(setAuthLoading(true));
        try {
          // Set client header temporarily
          apiClient.setAuthToken(token);
          const response = await apiClient.getCurrentUser();
          
          if (response.data.success) {
            dispatch(setUser(response.data.data));
          } else {
            // Token invalid/expired — confirmed by server
            dispatch(logout());
          }
        } catch (error: any) {
          // Only logout if the server explicitly says 401 Unauthorized.
          // Network errors / timeouts should NOT kick the user out.
          if (error?.response?.status === 401) {
            console.error('Token expired or invalid, logging out.');
            dispatch(logout());
          } else {
            console.warn('Failed to restore session (network issue?), keeping token:', error?.message);
            // Keep the token — don't logout. The user can retry by refreshing.
          }
        } finally {
          dispatch(setAuthLoading(false));
          setInitializing(false);
        }
      } else {
        dispatch(logout());
        setInitializing(false);
      }
    };

    restoreSession();
  }, [dispatch]);

  if (initializing || authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-slate-500 font-medium text-sm">Initializing Sentinel...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Console Area */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/cameras" element={<Cameras />} />
          <Route path="/branches" element={<Branches />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/visitors" element={<Visitors />} />
          
          {/* Settings and Reports Page (requires higher roles in standard setups) */}
          <Route path="/settings" element={
            <ProtectedRoute requiredPermission="manage:settings">
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute requiredPermission="view:reports">
              <ReportsPage />
            </ProtectedRoute>
          } />

          <Route path="/404" element={<NotFound />} />
        </Route>

        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Router>
  );
};

export default App;

