/**
 * Report Generator Component
 * Allows selection of report type, date range, and filters with export options
 */

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@store/store';
import apiClient from '../../services/api';
import {
  setReportType,
  setDateRange,
  setFilter,
  clearFilters,
  fetchAttendanceStart,
  fetchAttendanceSuccess,
  fetchAttendanceError,
  fetchVisitorsStart,
  fetchVisitorsSuccess,
  fetchVisitorsError,
  fetchCameraUptimeStart,
  fetchCameraUptimeSuccess,
  fetchCameraUptimeError,
  fetchSecurityStart,
  fetchSecuritySuccess,
  fetchSecurityError,
  fetchConsolidatedStart,
  fetchConsolidatedSuccess,
  fetchConsolidatedError,
  exportReportStart,
  exportReportSuccess,
  exportReportError,
} from '@store/slices/reportSlice';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import Select from '@components/common/Select';
import DatePicker from '@components/common/DatePicker';
import Input from '@components/common/Input';

const ReportGenerator: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    selectedType,
    fromDate,
    toDate,
    filters,
    loading,
  } = useAppSelector((state) => state.reports);

  const [localFromDate, setLocalFromDate] = useState<Date | null>(
    fromDate || new Date(new Date().setDate(new Date().getDate() - 30))
  );
  const [localToDate, setLocalToDate] = useState<Date | null>(toDate || new Date());
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'excel'>('pdf');

  const reportTypeOptions = [
    { value: 'attendance', label: 'Attendance Report' },
    { value: 'visitors', label: 'Visitor Report' },
    { value: 'camera_uptime', label: 'Camera Uptime Report' },
    { value: 'security_incidents', label: 'Security Incidents Report' },
    { value: 'consolidated', label: 'Consolidated Branch Report' },
  ];

  const handleGenerateReport = async () => {
    if (!localFromDate || !localToDate) {
      alert('Please select both start and end dates');
      return;
    }

    dispatch(setDateRange({ fromDate: localFromDate, toDate: localToDate }));

    const params = new URLSearchParams();
    params.append('from', localFromDate.toISOString().split('T')[0]);
    params.append('to', localToDate.toISOString().split('T')[0]);

    // Add filters if they exist
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    try {
      switch (selectedType) {
        case 'attendance': {
          dispatch(fetchAttendanceStart());
          const response = await apiClient.getAttendanceReport(
            localFromDate.toISOString().split('T')[0],
            localToDate.toISOString().split('T')[0]
          );
          const data = response.data.data || response.data;
          dispatch(fetchAttendanceSuccess({
            records: data.records || [],
            summary: data.summary || { present: 0, absent: 0, late: 0, earlyLeave: 0 },
          }));
          break;
        }
        case 'visitors': {
          dispatch(fetchVisitorsStart());
          const response = await apiClient.getVisitorsReport(
            localFromDate.toISOString().split('T')[0],
            localToDate.toISOString().split('T')[0]
          );
          const data = response.data.data || response.data;
          dispatch(fetchVisitorsSuccess({
            records: data.records || [],
            summary: data.summary || { totalVisitors: 0, avgDuration: 0, topHosts: [] },
          }));
          break;
        }
        case 'camera_uptime': {
          dispatch(fetchCameraUptimeStart());
          const response = await apiClient.getCameraUptimeReport();
          const data = response.data.data || response.data;
          dispatch(fetchCameraUptimeSuccess({
            records: data.records || [],
            summary: data.summary || { avgUptime: 0, onlineCameras: 0, offlineIncidents: 0 },
          }));
          break;
        }
        case 'security_incidents': {
          dispatch(fetchSecurityStart());
          const response = await apiClient.getSecurityIncidentsReport(
            localFromDate.toISOString().split('T')[0],
            localToDate.toISOString().split('T')[0]
          );
          const data = response.data.data || response.data;
          dispatch(fetchSecuritySuccess({
            records: data.records || [],
            summary: data.summary || { total: 0, critical: 0, warnings: 0, info: 0 },
          }));
          break;
        }
        case 'consolidated': {
          dispatch(fetchConsolidatedStart());
          const response = await apiClient.getConsolidatedReport(
            localFromDate.toISOString().split('T')[0],
            localToDate.toISOString().split('T')[0]
          );
          const data = response.data.data || response.data;
          dispatch(fetchConsolidatedSuccess(data));
          break;
        }
        default:
          break;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error generating report';
      switch (selectedType) {
        case 'attendance':
          dispatch(fetchAttendanceError(message));
          break;
        case 'visitors':
          dispatch(fetchVisitorsError(message));
          break;
        case 'camera_uptime':
          dispatch(fetchCameraUptimeError(message));
          break;
        case 'security_incidents':
          dispatch(fetchSecurityError(message));
          break;
        case 'consolidated':
          dispatch(fetchConsolidatedError(message));
          break;
        default:
          break;
      }
    }
  };

  const handleExport = async (format: 'pdf' | 'csv' | 'excel') => {
    if (!localFromDate || !localToDate) {
      alert('Please generate a report first');
      return;
    }

    dispatch(exportReportStart());
    try {
      const response = await fetch('/api/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          format,
          from: localFromDate.toISOString().split('T')[0],
          to: localToDate.toISOString().split('T')[0],
          filters,
        }),
      });

      if (!response.ok) throw new Error('Failed to export report');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${selectedType}-${Date.now()}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      dispatch(exportReportSuccess());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error exporting report';
      dispatch(exportReportError(message));
    }
  };

  return (
    <Card title="Report Generator" subtitle="Configure and generate reports">
      <div className="space-y-6">
        {/* Report Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Report Type"
            value={selectedType}
            onChange={(value) =>
              dispatch(
                setReportType(
                  value as 'attendance' | 'visitors' | 'camera_uptime' | 'security_incidents' | 'consolidated'
                )
              )
            }
            options={reportTypeOptions}
          />

          {/* Date Pickers */}
          <DatePicker
            label="From Date"
            value={localFromDate}
            onChange={setLocalFromDate}
            max={new Date()}
          />
          <DatePicker
            label="To Date"
            value={localToDate}
            onChange={setLocalToDate}
            max={new Date()}
          />

          {/* Generate Button */}
          <div className="flex items-end">
            <Button
              onClick={handleGenerateReport}
              isLoading={loading}
              className="w-full"
            >
              Generate Report
            </Button>
          </div>
        </div>

        {/* Export Options */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-slate-600">
              Export Report:
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport('pdf')}
              isLoading={loading}
            >
              Export PDF
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport('excel')}
              isLoading={loading}
            >
              Export Excel
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport('csv')}
              isLoading={loading}
            >
              Export CSV
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ReportGenerator;
