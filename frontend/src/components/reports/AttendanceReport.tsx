/**
 * Attendance Report Component
 * Displays attendance data with summaries, details table, and charts
 */

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@store/store';
import { setFilter, setReportView } from '@store/slices/reportSlice';
import Card from '@components/common/Card';
import Table from '@components/common/Table';
import Select from '@components/common/Select';
import Input from '@components/common/Input';
import Badge from '@components/common/Badge';
import Button from '@components/common/Button';

interface ChartData {
  date: string;
  count: number;
}

const AttendanceReport: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    attendanceData,
    attendanceSummary,
    filters,
    loading,
    reportView,
  } = useAppSelector((state) => state.reports);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');

  // Filter data based on search and department
  const filteredData = attendanceData.filter((record) => {
    const matchesSearch = record.employeeName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDept =
      !filterDepartment || record.employeeName.includes(filterDepartment);
    return matchesSearch && matchesDept;
  });

  const columns = [
    {
      key: 'employeeName',
      label: 'Employee',
      sortable: true,
    },
    {
      key: 'checkIn',
      label: 'Check-in',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm">
          {new Date(value).toLocaleTimeString()}
        </span>
      ),
    },
    {
      key: 'checkOut',
      label: 'Check-out',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm">
          {value ? new Date(value).toLocaleTimeString() : '-'}
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
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const colors: Record<string, string> = {
          present: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          absent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          late: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          early_leave: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        };
        return (
          <Badge className={colors[value] || ''}>
            {value.replace('_', ' ').toUpperCase()}
          </Badge>
        );
      },
    },
  ];

  // Generate simple chart data
  const generateChartData = (): ChartData[] => {
    const grouped: Record<string, number> = {};
    attendanceData.forEach((record) => {
      const date = new Date(record.checkIn).toLocaleDateString();
      grouped[date] = (grouped[date] || 0) + 1;
    });
    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  };

  const chartData = generateChartData();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="p-6">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Present
            </p>
            <p className="text-3xl font-bold text-green-700 dark:text-green-300 mt-2">
              {attendanceSummary.present}
            </p>
          </div>
        </Card>

        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="p-6">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              Absent
            </p>
            <p className="text-3xl font-bold text-red-700 dark:text-red-300 mt-2">
              {attendanceSummary.absent}
            </p>
          </div>
        </Card>

        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="p-6">
            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
              Late
            </p>
            <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300 mt-2">
              {attendanceSummary.late}
            </p>
          </div>
        </Card>

        <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
          <div className="p-6">
            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
              Early Leave
            </p>
            <p className="text-3xl font-bold text-orange-700 dark:text-orange-300 mt-2">
              {attendanceSummary.earlyLeave}
            </p>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={reportView === 'daily' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => dispatch(setReportView('daily'))}
            >
              Daily
            </Button>
            <Button
              variant={reportView === 'weekly' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => dispatch(setReportView('weekly'))}
            >
              Weekly
            </Button>
            <Button
              variant={reportView === 'monthly' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => dispatch(setReportView('monthly'))}
            >
              Monthly
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Search by employee name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              label="Filter by Department"
              value={filterDepartment}
              onChange={(val) => setFilterDepartment(val as string)}
              options={[
                { value: '', label: 'All Departments' },
                { value: 'HR', label: 'HR' },
                { value: 'Engineering', label: 'Engineering' },
                { value: 'Sales', label: 'Sales' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Data Table */}
      <Card title="Attendance Details">
        <Table
          columns={columns}
          data={filteredData}
          isLoading={loading}
          emptyMessage="No attendance records found"
          striped
          hoverable
        />
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <Card title="Daily Attendance Trend">
          <div className="p-6 h-64 flex flex-col gap-2">
            {chartData.slice(0, 7).map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-sm font-medium w-24 text-gray-600 dark:text-gray-400">
                  {item.date}
                </span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full"
                    style={{ width: `${(item.count / Math.max(...chartData.map(d => d.count))) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white w-12">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Department Distribution */}
        <Card title="By Department">
          <div className="p-6 space-y-4">
            {['HR', 'Engineering', 'Sales', 'Operations'].map((dept) => {
              const count = attendanceData.filter((r) =>
                r.employeeName.includes(dept)
              ).length;
              const max = Math.max(
                ...['HR', 'Engineering', 'Sales', 'Operations'].map((d) =>
                  attendanceData.filter((r) => r.employeeName.includes(d)).length
                )
              );
              return (
                <div key={dept} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-24 text-gray-600 dark:text-gray-400">
                    {dept}
                  </span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-purple-500 h-full"
                      style={{ width: `${(count / Math.max(max, 1)) * 100}%` }}
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

export default AttendanceReport;
