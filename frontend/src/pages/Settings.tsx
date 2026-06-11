import React from 'react';
import { useAppDispatch, useAppSelector } from '@store/store';
import { setTheme, setNotificationsEnabled, setSoundEnabled } from '@store/slices/uiSlice';
import { Card, Button } from '@components/common';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  const notificationsEnabled = useAppSelector((state) => state.ui.notificationsEnabled);
  const soundEnabled = useAppSelector((state) => state.ui.soundEnabled);

  const handleSaveChanges = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-900">Settings</h1>
        <p className="text-gray-600 dark:text-slate-500 mt-1">
          Configure application settings, theme preferences, and alerts
        </p>
      </div>

      <div className="max-w-2xl">
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-900 mb-4">
              General Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-600 mb-1.5">
                  Application Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-650 rounded-lg bg-white dark:bg-slate-100 text-gray-900 dark:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  defaultValue="CCTV People Tracking"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-600 mb-1.5">
                  Theme Preference
                </label>
                <select
                  value={theme}
                  onChange={(e) => dispatch(setTheme(e.target.value as 'light' | 'dark'))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-650 rounded-lg bg-white dark:bg-slate-100 text-gray-900 dark:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
                >
                  <option value="light">Light Theme</option>
                  <option value="dark">Dark Theme (Premium)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-slate-300 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-900 mb-4">
              Notifications & Audio
            </h2>
            <div className="space-y-4">
              <label className="flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => dispatch(setNotificationsEnabled(e.target.checked))}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-slate-300 dark:bg-slate-100"
                />
                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-slate-600">
                  Enable Desktop Notifications
                </span>
              </label>
              <label className="flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => dispatch(setSoundEnabled(e.target.checked))}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-slate-300 dark:bg-slate-100"
                />
                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-slate-600">
                  Enable System Sound Alerts
                </span>
              </label>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-slate-300 pt-6 flex justify-end">
            <Button variant="primary" onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
