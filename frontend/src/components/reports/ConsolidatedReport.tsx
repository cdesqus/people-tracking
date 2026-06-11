/**
 * Consolidated Branch Report Component
 * Displays a cross-branch summary matrix, overall system KPIs,
 * and detailed listings sorted by branch.
 */

import React, { useState } from 'react';
import { useAppSelector } from '@store/store';
import Card from '@components/common/Card';
import Table from '@components/common/Table';
import Badge from '@components/common/Badge';

const ConsolidatedReport: React.FC = () => {
  const { consolidatedData, loading } = useAppSelector((state) => state.reports);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-slate-500">Loading consolidated analytics...</span>
      </div>
    );
  }

  if (!consolidatedData) {
    return (
      <Card className="text-center p-8">
        <p className="text-gray-500 dark:text-slate-500">
          No consolidated report generated yet. Click "Generate Report" above to load data.
        </p>
      </Card>
    );
  }

  const { attendance, visitors, uptime, incidents, branches } = consolidatedData;

  // 1. Prepare Branch Summary Matrix Data
  const branchMatrixData = Object.entries(branches || {}).map(([code, data]: [string, any]) => ({
    code,
    name: data.name,
    attendanceRate: data.attendanceRate,
    visitorsCount: data.visitorsCount,
    cameraUptime: data.cameraUptime,
    camerasOnline: `${data.camerasOnlineCount}/${data.camerasTotalCount}`,
    incidentsCount: data.incidentsCount,
    critical: data.criticalCount,
    warning: data.warningCount,
    info: data.infoCount,
  }));

  const matrixColumns = [
    { key: 'name', label: 'Branch Location', sortable: true },
    { key: 'attendanceRate', label: 'Attendance Rate', sortable: true },
    { key: 'visitorsCount', label: 'Visitor Logs', sortable: true },
    { key: 'camerasOnline', label: 'Active Cameras', sortable: false },
    { key: 'cameraUptime', label: 'Avg Uptime', sortable: true },
    {
      key: 'incidentsCount',
      label: 'Security Alerts',
      sortable: true,
      render: (val: number, row: any) => (
        <div className="flex gap-1.5 items-center justify-center">
          {row.critical > 0 && (
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
              {row.critical} CRIT
            </Badge>
          )}
          {row.warning > 0 && (
            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
              {row.warning} WARN
            </Badge>
          )}
          {row.critical === 0 && row.warning === 0 && (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              Secured
            </Badge>
          )}
        </div>
      ),
    },
  ];

  // 2. Prepare detailed logs filtered by branch
  const getFilteredLogs = (branchCode: string) => {
    let logs: any[] = [];
    if (incidents && incidents.records) {
      incidents.records.forEach((inc: any) => {
        if (branchCode === 'all' || inc.branch === branchCode) {
          logs.push({ ...inc, category: 'Security' });
        }
      });
    }
    if (visitors && visitors.records) {
      visitors.records.forEach((vis: any) => {
        if (branchCode === 'all' || vis.branch === branchCode) {
          logs.push({
            id: vis.visitorId,
            type: 'visitor_access',
            timestamp: vis.checkIn,
            cameraName: 'Front Entrance',
            description: `Visitor ${vis.visitorName} from ${vis.organization} checked in, hosted by ${vis.hostName}.`,
            severity: 'info',
            resolved: true,
            category: 'Visitor',
            branch: vis.branch,
          });
        }
      });
    }
    if (attendance && attendance.records) {
      attendance.records.forEach((att: any) => {
        if (branchCode === 'all' || att.branch === branchCode) {
          if (att.status === 'late' || att.status === 'absent') {
            logs.push({
              id: att.employeeId,
              type: `employee_${att.status}`,
              timestamp: att.checkIn,
              cameraName: 'Face Scanner Gate',
              description: `Employee ${att.employeeName} flagged ${att.status.replace('_', ' ')}.`,
              severity: att.status === 'absent' ? 'warning' : 'info',
              resolved: true,
              category: 'Attendance',
              branch: att.branch,
            });
          }
        }
      });
    }

    // Sort by timestamp descending
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const activeLogs = getFilteredLogs(selectedBranch);

  const logsColumns = [
    {
      key: 'category',
      label: 'Category',
      render: (val: string) => {
        const colors: Record<string, string> = {
          Security: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
          Visitor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
          Attendance: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        };
        return <Badge className={colors[val]}>{val}</Badge>;
      },
    },
    {
      key: 'timestamp',
      label: 'Time',
      render: (val: string) => (
        <span className="text-sm font-mono">{new Date(val).toLocaleString()}</span>
      ),
    },
    {
      key: 'branch',
      label: 'Branch',
      render: (val: string) => {
        const map: Record<string, string> = {
          'br-hq': 'HQ',
          'br-bdg': 'BDG',
          'br-sby': 'SBY',
          'br-mdn': 'MDN',
          'br-ygk': 'YGK',
        };
        return <span className="font-semibold text-gray-700 dark:text-slate-600">{map[val] || val.toUpperCase()}</span>;
      },
    },
    {
      key: 'description',
      label: 'Activity Description',
    },
    {
      key: 'severity',
      label: 'Severity Level',
      render: (val: string) => {
        const colors: Record<string, string> = {
          critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
          warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
          info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        };
        return (
          <Badge className={colors[val] || 'bg-gray-100 text-gray-800'}>
            {val.toUpperCase()}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Overall System KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="p-6">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-600">
              Total Visitors Group
            </p>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-2">
              {visitors?.summary?.totalVisitors || 0}
            </p>
          </div>
        </Card>

        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="p-6">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              Critical Alerts (All Branches)
            </p>
            <p className="text-3xl font-bold text-red-700 dark:text-red-300 mt-2">
              {incidents?.summary?.critical || 0}
            </p>
          </div>
        </Card>

        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="p-6">
            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
              Security Warnings
            </p>
            <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300 mt-2">
              {incidents?.summary?.warnings || 0}
            </p>
          </div>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="p-6">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Avg Camera Network Uptime
            </p>
            <p className="text-3xl font-bold text-green-700 dark:text-green-300 mt-2">
              {uptime?.summary?.avgUptime ? `${uptime.summary.avgUptime.toFixed(2)}%` : '0%'}
            </p>
          </div>
        </Card>
      </div>

      {/* 2. Branch Breakdown Summary Matrix */}
      <Card title="Regional Branch Breakdown Summary Matrix" subtitle="Key metrics side-by-side across all active operational regions">
        <Table
          columns={matrixColumns}
          data={branchMatrixData}
          isLoading={loading}
          emptyMessage="No branch summary metrics found"
          striped
          hoverable
        />
      </Card>

      {/* 3. Branch Specific Logs Filter */}
      <div className="flex flex-col space-y-4">
        <Card title="Operational Log Itemization">
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-slate-500 mr-2">Filter Region:</span>
            <button
              onClick={() => setSelectedBranch('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedBranch === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-slate-600 dark:hover:bg-gray-700'
              }`}
            >
              All Regions
            </button>
            {Object.entries(branches || {}).map(([code, data]: [string, any]) => (
              <button
                key={code}
                onClick={() => setSelectedBranch(code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedBranch === code
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-slate-600 dark:hover:bg-gray-700'
                }`}
              >
                {data.name.split(' ')[0]}
              </button>
            ))}
          </div>

          <Table
            columns={logsColumns}
            data={activeLogs}
            isLoading={loading}
            emptyMessage={`No activity logs registered for ${
              selectedBranch === 'all' ? 'any branch' : branches[selectedBranch]?.name || selectedBranch
            }`}
            striped
            hoverable
          />
        </Card>
      </div>
    </div>
  );
};

export default ConsolidatedReport;
