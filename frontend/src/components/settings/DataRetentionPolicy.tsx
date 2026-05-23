/**
 * Data Retention Policy Component
 * Configure data retention settings
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

const DataRetentionPolicy: React.FC = () => {
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

  const RetentionSlider: React.FC<{
    label: string;
    description: string;
    value: number;
    min: number;
    max: number;
    onChange: (value: number) => void;
  }> = ({ label, description, value, min, max, onChange }) => (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          {value} days
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step="1"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        {description}
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card title="Data Retention Settings" subtitle="Configure how long data is stored">
        <div className="space-y-4">
          <RetentionSlider
            label="Face Image Retention"
            description="How long to keep face detection images"
            value={settings.dataRetention.faceImageDays}
            min={7}
            max={365}
            onChange={(value) =>
              setSettings({
                ...settings,
                dataRetention: {
                  ...settings.dataRetention,
                  faceImageDays: value,
                },
              })
            }
          />

          <RetentionSlider
            label="Detection Log Retention"
            description="How long to keep detection records and logs"
            value={settings.dataRetention.detectionLogDays}
            min={30}
            max={365}
            onChange={(value) =>
              setSettings({
                ...settings,
                dataRetention: {
                  ...settings.dataRetention,
                  detectionLogDays: value,
                },
              })
            }
          />

          <RetentionSlider
            label="Video Archive Retention"
            description="How long to keep video recordings"
            value={settings.dataRetention.videoArchiveDays}
            min={7}
            max={365}
            onChange={(value) =>
              setSettings({
                ...settings,
                dataRetention: {
                  ...settings.dataRetention,
                  videoArchiveDays: value,
                },
              })
            }
          />
        </div>
      </Card>

      {/* Auto-Delete Settings */}
      <Card title="Automatic Cleanup" subtitle="Automatically delete old data">
        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              Auto-Delete Old Data
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Automatically delete files older than the retention period
            </p>
          </div>
          <Checkbox
            checked={settings.dataRetention.autoDelete}
            onChange={(checked) =>
              setSettings({
                ...settings,
                dataRetention: {
                  ...settings.dataRetention,
                  autoDelete: checked,
                },
              })
            }
          />
        </div>
      </Card>

      {/* Summary Card */}
      <Card title="Retention Summary" subtitle="Overview of your retention policy">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              Face Images
            </p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
              {settings.dataRetention.faceImageDays} days
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              ~{(settings.dataRetention.faceImageDays / 30).toFixed(1)} months
            </p>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
              Detection Logs
            </p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
              {settings.dataRetention.detectionLogDays} days
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              ~{(settings.dataRetention.detectionLogDays / 30).toFixed(1)} months
            </p>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
              Video Archive
            </p>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">
              {settings.dataRetention.videoArchiveDays} days
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
              ~{(settings.dataRetention.videoArchiveDays / 30).toFixed(1)} months
            </p>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          isLoading={loading}
        >
          Save Retention Policy
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

export default DataRetentionPolicy;
