/**
 * Security Incidents Report Component
 * Displays security incidents with severity filtering and statistics
 */

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@store/store';
import { setFilter } from '@store/slices/reportSlice';
import Card from '@components/common/Card';
import Table from '@components/common/Table';
import Select from '@components/common/Select';
import Badge from '@components/common/Badge';
import Input from '@components/common/Input';

const SecurityReport: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    securityIncidentData,
    securitySummary,
    filters,
    loading,
  } = useAppSelector((state) => state.reports);

  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  // Filter data
  const filteredData = securityIncidentData.filter((record) => {
    const matchesSearch =
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.cameraName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity =
      !severityFilter || record.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const getSeverityColor = (
    severity: string
  ): { bg: string; text: string; icon: string } => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-100 dark:bg-red-900/30',
          text: 'text-red-700 dark:text-red-300',
          icon: '🔴',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
          text: 'text-yellow-700 dark:text-yellow-300',
          icon: '🟡',
        };
      case 'info':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          text: 'text-blue-700 dark:text-blue-300',
          icon: '🔵',
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-800',
          text: 'text-gray-700 dark:text-gray-300',
          icon: '⚪',
        };
    }
  };

  const columns = [
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value: string) => (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {value}
        </Badge>
      ),
    },
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm">
          {new Date(value).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'cameraName',
      label: 'Camera',
      sortable: true,
    },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      render: (value: string) => (
        <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
          {value}
        </span>
      ),
    },
    {
      key: 'severity',
      label: 'Severity',
      sortable: true,
      render: (value: string) => {
        const color = getSeverityColor(value);
        return (
          <Badge className={`${color.bg} ${color.text}`}>
            {value.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      key: 'resolved',
      label: 'Status',
      sortable: true,
      render: (value: boolean) => (
        <Badge
          className={
            value
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
          }
        >
          {value ? 'Resolved' : 'Active'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800">
          <div className="p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Incidents
            </p>
            <p className="text-3xl font-bold text-gray-700 dark:text-gray-300 mt-2">
              {securitySummary.total}
            </p>
          </div>
        </Card>

        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="p-6">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              Critical
            </p>
            <p className="text-3xl font-bold text-red-700 dark:text-red-300 mt-2">
              {securitySummary.critical}
            </p>
          </div>
        </Card>

        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="p-6">
            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
              Warnings
            </p>
            <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300 mt-2">
              {securitySummary.warnings}
            </p>
          </div>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="p-6">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Info
            </p>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-2">
              {securitySummary.info}
            </p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Search by description or camera..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              label="Filter by Severity"
              value={severityFilter}
              onChange={setSeverityFilter}
              options={[
                { value: '', label: 'All Severities' },
                { value: 'critical', label: 'Critical' },
                { value: 'warning', label: 'Warning' },
                { value: 'info', label: 'Info' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Data Table */}
      <Card title="Incident Details">
        <Table
          columns={columns}
          data={filteredData}
          isLoading={loading}
          emptyMessage="No security incidents found"
          striped
          hoverable
        />
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <Card title="Incidents by Severity">
          <div className="p-6 space-y-4">
            {[
              { label: 'Critical', count: securitySummary.critical, color: 'bg-red-500' },
              { label: 'Warnings', count: securitySummary.warnings, color: 'bg-yellow-500' },
              { label: 'Info', count: securitySummary.info, color: 'bg-blue-500' },
            ].map((item) => {
              const percent =
                securitySummary.total > 0
                  ? ((item.count / securitySummary.total) * 100).toFixed(1)
                  : '0';
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {percent}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${item.color}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {item.count} incidents
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Incident Types */}
        <Card title="Top Incident Types">
          <div className="p-6 space-y-3">
            {(() => {
              const types: Record<string, number> = {};
              securityIncidentData.forEach((inc) => {
                types[inc.type] = (types[inc.type] || 0) + 1;
              });

              return Object.entries(types)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([type, count]) => {
                  const max = Math.max(...Object.values(types));
                  return (
                    <div key={type} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-32 text-gray-600 dark:text-gray-400 truncate">
                        {type}
                      </span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                        <div
                          className="bg-purple-500 h-full"
                          style={{
                            width: `${(count / Math.max(max, 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white w-12">
                        {count}
                      </span>
                    </div>
                  );
                });
            })()}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SecurityReport;
