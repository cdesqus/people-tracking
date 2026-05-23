/**
 * Camera Uptime Report Component
 * Displays camera uptime statistics with color-coded status
 */

import React, { useState } from 'react';
import { useAppSelector } from '@store/store';
import Card from '@components/common/Card';
import Table from '@components/common/Table';
import Badge from '@components/common/Badge';
import Input from '@components/common/Input';

const CameraUptimeReport: React.FC = () => {
  const {
    cameraUptimeData,
    cameraUptimeSummary,
    loading,
  } = useAppSelector((state) => state.reports);

  const [searchTerm, setSearchTerm] = useState('');

  // Filter data
  const filteredData = cameraUptimeData.filter((record) =>
    record.cameraName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get status color
  const getStatusColor = (
    uptime: number
  ): { bg: string; text: string; color: string } => {
    if (uptime >= 98) {
      return {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-700 dark:text-green-300',
        color: 'bg-green-500',
      };
    } else if (uptime >= 95) {
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        text: 'text-yellow-700 dark:text-yellow-300',
        color: 'bg-yellow-500',
      };
    }
    return {
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-300',
      color: 'bg-red-500',
    };
  };

  const columns = [
    {
      key: 'cameraName',
      label: 'Camera Name',
      sortable: true,
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
    },
    {
      key: 'uptimePercent',
      label: 'Uptime %',
      sortable: true,
      render: (value: number) => {
        const status = getStatusColor(value);
        return (
          <div className="flex items-center gap-2">
            <div className={`w-12 h-12 rounded-lg ${status.bg} flex items-center justify-center`}>
              <span className={`font-bold ${status.text}`}>
                {value.toFixed(2)}%
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'lastOffline',
      label: 'Last Offline',
      sortable: true,
      render: (value: string | null) => (
        <span className="text-sm">
          {value ? new Date(value).toLocaleString() : 'Never'}
        </span>
      ),
    },
    {
      key: 'offlineDuration',
      label: 'Offline Duration',
      sortable: true,
      render: (value: number) => {
        const hours = Math.floor(value / 60);
        const mins = value % 60;
        return <span>{hours}h {mins}m</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="p-6">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Avg Uptime
            </p>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-2">
              {cameraUptimeSummary.avgUptime.toFixed(2)}%
            </p>
          </div>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="p-6">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Online Cameras
            </p>
            <p className="text-3xl font-bold text-green-700 dark:text-green-300 mt-2">
              {cameraUptimeSummary.onlineCameras}
            </p>
          </div>
        </Card>

        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="p-6">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              Offline Incidents
            </p>
            <p className="text-3xl font-bold text-red-700 dark:text-red-300 mt-2">
              {cameraUptimeSummary.offlineIncidents}
            </p>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <Input
          placeholder="Search by camera name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      {/* Data Table */}
      <Card title="Camera Details">
        <Table
          columns={columns}
          data={filteredData}
          isLoading={loading}
          emptyMessage="No camera records found"
          striped
          hoverable
        />
      </Card>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <Card title="Uptime Status Distribution">
          <div className="p-6 space-y-4">
            {(() => {
              const excellent = cameraUptimeData.filter((c) => c.uptimePercent >= 98).length;
              const good = cameraUptimeData.filter((c) => c.uptimePercent >= 95 && c.uptimePercent < 98).length;
              const poor = cameraUptimeData.filter((c) => c.uptimePercent < 95).length;

              return [
                { label: 'Excellent (≥98%)', count: excellent, color: 'bg-green-500' },
                { label: 'Good (95-98%)', count: good, color: 'bg-yellow-500' },
                { label: 'Poor (<95%)', count: poor, color: 'bg-red-500' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.count}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${item.color}`}
                      style={{
                        width: `${(item.count / Math.max(cameraUptimeData.length, 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ));
            })()}
          </div>
        </Card>

        {/* Uptime Trend */}
        <Card title="Recent Uptime Trend">
          <div className="p-6">
            <div className="space-y-3">
              {filteredData.slice(0, 5).map((camera, idx) => {
                const status = getStatusColor(camera.uptimePercent);
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-32 text-gray-600 dark:text-gray-400 truncate">
                      {camera.cameraName}
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                      <div
                        className={`h-full ${status.color}`}
                        style={{
                          width: `${camera.uptimePercent}%`,
                        }}
                      />
                    </div>
                    <span className={`text-sm font-semibold w-16 text-right ${status.text}`}>
                      {camera.uptimePercent.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CameraUptimeReport;
