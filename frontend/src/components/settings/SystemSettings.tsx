/**
 * System Settings Component
 * Manage alert rules, confidence thresholds, and detection sensitivity
 */

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@store/store';
import {
  updateSettingsStart,
  updateSettingsSuccess,
  updateSettingsError,
} from '@store/slices/settingsSlice';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import Checkbox from '@components/common/Checkbox';
import Input from '@components/common/Input';

const SystemSettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    systemSettings,
    loading,
  } = useAppSelector((state) => state.settings);

  const [settings, setSettings] = useState(systemSettings);

  useEffect(() => {
    setSettings(systemSettings);
  }, [systemSettings]);

  const handleSave = async () => {
    dispatch(updateSettingsStart());
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to update settings');

      const data = await response.json();
      dispatch(updateSettingsSuccess(data));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error saving settings';
      dispatch(updateSettingsError(message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Rules */}
      <Card title="Alert Rules" subtitle="Configure notification channels">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-slate-900">
                Email Notifications
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-500">
                Receive alerts via email
              </p>
            </div>
            <Checkbox
              checked={settings.alertRules.emailEnabled}
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  alertRules: {
                    ...settings.alertRules,
                    emailEnabled: checked,
                  },
                })
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-slate-900">
                SMS Notifications
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-500">
                Receive alerts via SMS
              </p>
            </div>
            <Checkbox
              checked={settings.alertRules.smsEnabled}
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  alertRules: {
                    ...settings.alertRules,
                    smsEnabled: checked,
                  },
                })
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-slate-900">
                Slack Notifications
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-500">
                Send alerts to Slack
              </p>
            </div>
            <Checkbox
              checked={settings.alertRules.slackEnabled}
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  alertRules: {
                    ...settings.alertRules,
                    slackEnabled: checked,
                  },
                })
              }
            />
          </div>
        </div>
      </Card>

      {/* Thresholds */}
      <Card title="Detection Thresholds" subtitle="Adjust sensitivity and confidence levels">
        <div className="space-y-6">
          {/* Confidence Threshold */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-600 mb-2">
              Confidence Threshold
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={settings.thresholds.confidenceThreshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    thresholds: {
                      ...settings.thresholds,
                      confidenceThreshold: parseInt(e.target.value),
                    },
                  })
                }
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-xl font-bold text-gray-900 dark:text-slate-900 w-16 text-right">
                {settings.thresholds.confidenceThreshold}%
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">
              Minimum confidence level for detections (0-100%)
            </p>
          </div>

          {/* Detection Sensitivity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-600 mb-2">
              Detection Sensitivity
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={settings.thresholds.detectionSensitivity}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    thresholds: {
                      ...settings.thresholds,
                      detectionSensitivity: parseInt(e.target.value),
                    },
                  })
                }
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
              <span className="text-xl font-bold text-gray-900 dark:text-slate-900 w-16 text-right">
                {settings.thresholds.detectionSensitivity}%
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">
              How sensitive the system is to detecting objects (0-100%)
            </p>
          </div>
        </div>
      </Card>

      {/* Camera Check Interval */}
      <Card title="Camera Monitoring" subtitle="Configure camera health checks">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-600 mb-2">
            Camera Check Interval (seconds)
          </label>
          <Input
            type="number"
            value={settings.camera.checkInterval}
            onChange={(e) =>
              setSettings({
                ...settings,
                camera: {
                  ...settings.camera,
                  checkInterval: parseInt(e.target.value),
                },
              })
            }
            min="10"
            max="300"
          />
          <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">
            Frequency of camera health checks (10-300 seconds)
          </p>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          isLoading={loading}
        >
          Save Settings
        </Button>
        <Button
          variant="secondary"
          onClick={() => setSettings(systemSettings)}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default SystemSettings;
