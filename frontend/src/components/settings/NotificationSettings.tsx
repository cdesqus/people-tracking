/**
 * Notification Settings Component
 * Configure notification channels and preferences
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
import Select from '@components/common/Select';

const NotificationSettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    systemSettings,
    loading,
  } = useAppSelector((state) => state.settings);

  const [settings, setSettings] = useState(systemSettings);
  const [testNotificationLoading, setTestNotificationLoading] = useState(false);

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

  const handleTestNotification = async () => {
    setTestNotificationLoading(true);
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: 'email' }),
      });

      if (response.ok) {
        alert('Test notification sent successfully!');
      } else {
        alert('Failed to send test notification');
      }
    } catch (error) {
      alert('Error sending test notification');
    } finally {
      setTestNotificationLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card title="Email Notifications" subtitle="Configure email alert settings">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Enable Email Notifications
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive alerts via email
              </p>
            </div>
            <Checkbox
              checked={settings.notifications.emailEnabled}
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  notifications: {
                    ...settings.notifications,
                    emailEnabled: checked,
                  },
                })
              }
            />
          </div>

          {settings.notifications.emailEnabled && (
            <div className="pl-4 border-l-4 border-blue-500 space-y-3">
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Checkbox
                  checked={settings.notifications.notificationTypes.alerts}
                  onChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        notificationTypes: {
                          ...settings.notifications.notificationTypes,
                          alerts: checked,
                        },
                      },
                    })
                  }
                />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Send alerts
                </label>
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Checkbox
                  checked={settings.notifications.notificationTypes.dailyReport}
                  onChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        notificationTypes: {
                          ...settings.notifications.notificationTypes,
                          dailyReport: checked,
                        },
                      },
                    })
                  }
                />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Send daily report
                </label>
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Checkbox
                  checked={settings.notifications.notificationTypes.weeklySummary}
                  onChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        notificationTypes: {
                          ...settings.notifications.notificationTypes,
                          weeklySummary: checked,
                        },
                      },
                    })
                  }
                />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Send weekly summary
                </label>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Slack Configuration */}
      <Card title="Slack Integration" subtitle="Configure Slack notifications">
        <div className="space-y-4">
          <Input
            label="Slack Webhook URL"
            type="password"
            value={settings.notifications.slackWebhookUrl || ''}
            onChange={(e) =>
              setSettings({
                ...settings,
                notifications: {
                  ...settings.notifications,
                  slackWebhookUrl: e.target.value,
                },
              })
            }
            placeholder="https://hooks.slack.com/services/..."
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Get your webhook URL from Slack app configuration
          </p>
        </div>
      </Card>

      {/* SMS Gateway */}
      <Card title="SMS Gateway Configuration" subtitle="Configure SMS notifications">
        <div className="space-y-4">
          <Select
            label="SMS Provider"
            value={settings.notifications.smsGatewayConfig?.provider || ''}
            onChange={(value) =>
              setSettings({
                ...settings,
                notifications: {
                  ...settings.notifications,
                  smsGatewayConfig: {
                    ...settings.notifications.smsGatewayConfig,
                    provider: value as string,
                  },
                },
              })
            }
            options={[
              { value: '', label: 'Select a provider' },
              { value: 'twilio', label: 'Twilio' },
              { value: 'aws_sns', label: 'AWS SNS' },
              { value: 'nexmo', label: 'Nexmo/Vonage' },
            ]}
          />

          {settings.notifications.smsGatewayConfig?.provider && (
            <Input
              label="API Key"
              type="password"
              value={settings.notifications.smsGatewayConfig?.apiKey || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notifications: {
                    ...settings.notifications,
                    smsGatewayConfig: {
                      ...settings.notifications.smsGatewayConfig,
                      provider: settings.notifications.smsGatewayConfig?.provider || '',
                      apiKey: e.target.value,
                    },
                  },
                })
              }
              placeholder="Enter your API key"
            />
          )}
        </div>
      </Card>

      {/* Test Notification */}
      <Card title="Test Notifications" subtitle="Send a test notification to verify settings">
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleTestNotification}
            isLoading={testNotificationLoading}
          >
            Send Test Email
          </Button>
          <Button
            variant="secondary"
            onClick={handleTestNotification}
            isLoading={testNotificationLoading}
          >
            Send Test Slack Message
          </Button>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          isLoading={loading}
        >
          Save Notification Settings
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

export default NotificationSettings;
