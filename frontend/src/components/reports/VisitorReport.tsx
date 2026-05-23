/**
 * Visitor Report Component
 * Displays visitor statistics and details with pie chart
 */

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@store/store';
import Card from '@components/common/Card';
import Table from '@components/common/Table';
import Input from '@components/common/Input';
import Select from '@components/common/Select';
import Badge from '@components/common/Badge';

const VisitorReport: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    visitorData,
    visitorSummary,
    loading,
  } = useAppSelector((state) => state.reports);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrg, setFilterOrg] = useState('');

  // Filter data
  const filteredData = visitorData.filter((record) => {
    const matchesSearch =
      record.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.organization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrg =
      !filterOrg || record.organization === filterOrg;
    return matchesSearch && matchesOrg;
  });

  const columns = [
    {
      key: 'visitorName',
      label: 'Visitor Name',
      sortable: true,
    },
    {
      key: 'organization',
      label: 'Organization',
      sortable: true,
    },
    {
      key: 'checkIn',
      label: 'Check-in',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm">
          {new Date(value).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'checkOut',
      label: 'Check-out',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm">
          {value ? new Date(value).toLocaleString() : '-'}
        </span>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      sortable: true,
      render: (value: number) => {
        const hours = Math.floor(value / 60);
        const mins = value % 60;
        return <span>{hours}h {mins}m</span>;
      },
    },
    {
      key: 'hostName',
      label: 'Host',
      sortable: true,
    },
  ];

  // Get unique organizations for pie chart
  const orgDistribution: Record<string, number> = {};
  visitorData.forEach((record) => {
    orgDistribution[record.organization] =
      (orgDistribution[record.organization] || 0) + 1;
  });

  const colors = [
    '#3b82f6',
    '#ef4444',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#ec4899',
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="p-6">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Total Visitors
            </p>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-2">
              {visitorSummary.totalVisitors}
            </p>
          </div>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
          <div className="p-6">
            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
              Avg Visit Duration
            </p>
            <p className="text-3xl font-bold text-purple-700 dark:text-purple-300 mt-2">
              {Math.floor(visitorSummary.avgDuration)}m
            </p>
          </div>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="p-6">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Top Hosts
            </p>
            <div className="mt-2 flex flex-col gap-1">
              {visitorSummary.topHosts.slice(0, 2).map((host, idx) => (
                <span key={idx} className="text-sm text-green-700 dark:text-green-300">
                  {host}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Search by visitor or organization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              label="Filter by Organization"
              value={filterOrg}
              onChange={(val) => setFilterOrg(val as string)}
              options={[
                { value: '', label: 'All Organizations' },
                ...Array.from(new Set(visitorData.map((r) => r.organization))).map(
                  (org) => ({ value: org, label: org })
                ),
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Data Table */}
      <Card title="Visitor Details">
        <Table
          columns={columns}
          data={filteredData}
          isLoading={loading}
          emptyMessage="No visitor records found"
          striped
          hoverable
        />
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card title="Visitors by Organization">
          <div className="p-6">
            <div className="flex flex-col gap-4">
              {Object.entries(orgDistribution).map(([org, count], idx) => {
                const total = Object.values(orgDistribution).reduce(
                  (a, b) => a + b,
                  0
                );
                const percent = ((count / total) * 100).toFixed(1);
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: colors[idx % colors.length] }}
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {org}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {percent}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          backgroundColor: colors[idx % colors.length],
                          width: `${percent}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {count} visitors
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Host Distribution */}
        <Card title="Top Hosts">
          <div className="p-6 space-y-3">
            {visitorSummary.topHosts.map((host, idx) => {
              const count = visitorData.filter((r) => r.hostName === host).length;
              const max = Math.max(
                ...visitorSummary.topHosts.map((h) =>
                  visitorData.filter((r) => r.hostName === h).length
                )
              );
              return (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-24 text-gray-600 dark:text-gray-400">
                    {host}
                  </span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-orange-500 h-full"
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
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VisitorReport;
