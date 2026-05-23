/**
 * Alert Panel Component
 * Shows active alerts with severity colors
 * Real-time updates with new alerts appearing at top
 */

import React, { useEffect, useState } from 'react';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';
import Button from '@components/common/Button';
import { Alert } from '@types/index';
import { formatRelativeTime } from '@utils/formatTime';

interface AlertPanelProps {
  alerts: Alert[];
  loading?: boolean;
  onAlertClick?: (alert: Alert) => void;
  onAcknowledge?: (alertId: string) => void;
}

const AlertPanel: React.FC<AlertPanelProps> = ({
  alerts,
  loading = false,
  onAlertClick,
  onAcknowledge,
}) => {
  const [displayAlerts, setDisplayAlerts] = useState<Alert[]>([]);

  // Update display alerts when alerts prop changes
  useEffect(() => {
    setDisplayAlerts(alerts);
  }, [alerts]);

  const getSeverityColor = (severity: string): 'red' | 'yellow' | 'blue' | 'green' => {
    switch (severity) {
      case 'critical':
        return 'red';
      case 'high':
        return 'red';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'blue';
      default:
        return 'blue';
    }
  };

  const getSeverityIcon = (severity: string): string => {
    switch (severity) {
      case 'critical':
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🔵';
      default:
        return '⚪';
    }
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'match':
        return '👤';
      case 'unknown_face':
        return '❓';
      case 'suspicious_activity':
        return '⚠️';
      case 'system_error':
        return '❌';
      default:
        return '📢';
    }
  };

  const activeAlerts = displayAlerts.filter((a) => !a.acknowledged);
  const acknowledgedAlerts = displayAlerts.filter((a) => a.acknowledged);

  const renderAlertsList = (alertsList: Alert[], isAcknowledged: boolean) => {
    if (alertsList.length === 0) {
      return (
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">
            {isAcknowledged ? 'No acknowledged alerts' : 'No active alerts'}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {alertsList.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-300 ${
              isAcknowledged
                ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60'
                : getSeverityColor(alert.severity) === 'red'
                ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                : getSeverityColor(alert.severity) === 'yellow'
                ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800'
                : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
            } cursor-pointer hover:shadow-md`}
            onClick={() => onAlertClick?.(alert)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter') onAlertClick?.(alert);
            }}
          >
            {/* Icon and Status */}
            <div className="flex-shrink-0 pt-1">
              <span className="text-2xl">{getSeverityIcon(alert.severity)}</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xl">{getTypeIcon(alert.type)}</span>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {alert.title}
                    </h4>
                    <Badge
                      color={getSeverityColor(alert.severity)}
                      size="sm"
                      className="text-xs"
                    >
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {alert.description}
                  </p>

                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                    {alert.camera_id && (
                      <span>📹 Camera {alert.camera_id}</span>
                    )}
                    <span className="flex items-center gap-1">
                      🕐 {formatRelativeTime(alert.created_at)}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                {!isAcknowledged && (
                  <div className="flex-shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAcknowledge?.(alert.id);
                      }}
                      className="whitespace-nowrap"
                    >
                      Acknowledge
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card
      title="Alerts"
      subtitle={`${activeAlerts.length} active, ${acknowledgedAlerts.length} acknowledged`}
    >
      <div className="flex flex-col gap-6">
        {/* Active Alerts */}
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Active Alerts ({activeAlerts.length})
          </h3>
          <div className="max-h-96 overflow-y-auto pr-2">
            {loading ? (
              <div className="py-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            ) : (
              renderAlertsList(activeAlerts, false)
            )}
          </div>
        </div>

        {/* Divider */}
        {acknowledgedAlerts.length > 0 && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-700" />

            {/* Acknowledged Alerts */}
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Acknowledged ({acknowledgedAlerts.length})
              </h3>
              <div className="max-h-48 overflow-y-auto pr-2">
                {renderAlertsList(acknowledgedAlerts, true)}
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default AlertPanel;
