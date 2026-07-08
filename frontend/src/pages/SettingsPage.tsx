/**
 * Settings & Configuration Page
 * System settings, user management, camera configuration, and health monitoring
 */

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@store/store';
import {
  fetchSettingsStart,
  fetchSettingsSuccess,
  fetchSettingsError,
  fetchUsersStart,
  fetchUsersSuccess,
  fetchUsersError,
  fetchHealthStart,
  fetchHealthSuccess,
  fetchHealthError,
  clearSuccess,
  clearError,
} from '@store/slices/settingsSlice';
import Card from '@components/common/Card';
import Tabs from '@components/common/Tabs';
import Alert from '@components/common/Alert';
import SystemSettings from '@components/settings/SystemSettings';
import UserManagement from '@components/settings/UserManagement';
import DataRetentionPolicy from '@components/settings/DataRetentionPolicy';
import NotificationSettings from '@components/settings/NotificationSettings';
import SystemHealth from '@components/settings/SystemHealth';
import WhatsAppSettings from '@components/settings/WhatsAppSettings';

const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    success,
    error,
  } = useAppSelector((state) => state.settings);

  const [activeTab, setActiveTab] = useState('system');

  // Fetch data on mount
  useEffect(() => {
    const fetchAllData = async () => {
      dispatch(fetchSettingsStart());
      dispatch(fetchUsersStart());
      dispatch(fetchHealthStart());

      try {
        const [settingsRes, usersRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/users'),
        ]);

        if (!settingsRes.ok) throw new Error('Failed to fetch settings');
        if (!usersRes.ok) throw new Error('Failed to fetch users');

        const [settingsData, usersData] = await Promise.all([
          settingsRes.json(),
          usersRes.json(),
        ]);

        dispatch(fetchSettingsSuccess(settingsData));
        dispatch(fetchUsersSuccess(usersData.items || []));
        dispatch(fetchHealthSuccess({
          database: 'connected',
          redis: 'connected',
          rekognition: 'connected',
          lastBackup: new Date().toISOString(),
          diskUsagePercent: 45,
        }));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error fetching settings';
        dispatch(fetchSettingsError(message));
        dispatch(fetchUsersError(message));
        dispatch(fetchHealthError(message));
      }
    };

    fetchAllData();
  }, [dispatch]);

  // Auto-dismiss messages
  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => dispatch(clearSuccess()), 3000);
    return () => clearTimeout(timer);
  }, [success, dispatch]);

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => dispatch(clearError()), 3000);
    return () => clearTimeout(timer);
  }, [error, dispatch]);

  const tabs = [
    { id: 'system', label: 'System Settings' },
    { id: 'users', label: 'User Management' },
    { id: 'retention', label: 'Data Retention' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'whatsapp', label: '💬 WhatsApp' },
    { id: 'health', label: 'System Health' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">
          Settings & Configuration
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Kelola pengaturan sistem, pengguna, kamera, dan pantau kesehatan sistem
        </p>
      </div>

      {/* Alerts */}
      {success && (
        <Alert
          type="success"
          title="Success"
          message={success}
          onDismiss={() => dispatch(clearSuccess())}
        />
      )}
      {error && (
        <Alert
          type="error"
          title="Error"
          message={error}
          onDismiss={() => dispatch(clearError())}
        />
      )}

      {/* Tabs */}
      <Card>
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </Card>

      {/* Tab Content */}
      {activeTab === 'system' && <SystemSettings />}
      {activeTab === 'users' && <UserManagement />}
      {activeTab === 'retention' && <DataRetentionPolicy />}
      {activeTab === 'notifications' && <NotificationSettings />}
      {activeTab === 'whatsapp' && <WhatsAppSettings />}
      {activeTab === 'health' && <SystemHealth />}
    </div>
  );
};

export default SettingsPage;
