/**
 * Dashboard KPI Overview Cards
 * Shows: Occupancy, Active Cameras, Active Alerts, Current Visitors
 */

import React from 'react';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';

interface OverviewProps {
  occupancy: number;
  activeCameras: number;
  totalCameras: number;
  activeAlerts: number;
  currentVisitors: number;
  loading?: boolean;
}

const DashboardOverview: React.FC<OverviewProps> = ({
  occupancy,
  activeCameras,
  totalCameras,
  activeAlerts,
  currentVisitors,
  loading = false,
}) => {
  const getAlertColor = (count: number) => {
    if (count === 0) return 'green';
    if (count < 5) return 'yellow';
    return 'red';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Occupancy Card */}
      <Card className="relative overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-slate-500">
                Current Occupancy
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-slate-900 mt-2">
                {loading ? '-' : occupancy}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                People detected
              </p>
            </div>
            <div className="text-5xl text-blue-100 dark:text-blue-900 opacity-30">
              👥
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((occupancy / 100) * 100, 100)}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Active Cameras Card */}
      <Card className="relative overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-slate-500">
                Active Cameras
              </p>
              <div className="flex items-baseline gap-1 mt-2">
                <p className="text-3xl font-bold text-gray-900 dark:text-slate-900">
                  {loading ? '-' : activeCameras}
                </p>
                <p className="text-lg font-medium text-gray-500 dark:text-slate-500">
                  /{totalCameras}
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                Online / Total
              </p>
            </div>
            <div className="text-5xl text-green-100 dark:text-green-900 opacity-30">
              📹
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${totalCameras > 0 ? (activeCameras / totalCameras) * 100 : 0}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Active Alerts Card */}
      <Card className="relative overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-slate-500">
                Active Alerts
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-slate-900 mt-2">
                {loading ? '-' : activeAlerts}
              </p>
              <div className="mt-1">
                <Badge
                  color={getAlertColor(activeAlerts)}
                  size="sm"
                  className="text-xs"
                >
                  {activeAlerts === 0 ? 'All Clear' : `${activeAlerts} Active`}
                </Badge>
              </div>
            </div>
            <div className={`text-5xl opacity-30 ${
              activeAlerts === 0 ? 'text-green-100 dark:text-green-900' : 'text-red-100 dark:text-red-900'
            }`}>
              {activeAlerts === 0 ? '✓' : '!'}
            </div>
          </div>
          {/* Alert indicator */}
          <div className="mt-4 flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  i < activeAlerts
                    ? 'bg-red-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Current Visitors Card */}
      <Card className="relative overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-slate-500">
                Current Visitors
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-slate-900 mt-2">
                {loading ? '-' : currentVisitors}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                Known individuals
              </p>
            </div>
            <div className="text-5xl text-purple-100 dark:text-purple-900 opacity-30">
              👤
            </div>
          </div>
          {/* Status indicator */}
          <div className="mt-4 flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-xs text-gray-600 dark:text-slate-500">
              Live tracking enabled
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardOverview;
