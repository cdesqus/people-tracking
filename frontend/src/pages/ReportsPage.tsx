/**
 * Reports & Analytics Page
 * Comprehensive reporting system with multiple report types and export capabilities
 */

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@store/store';
import {
  setReportType,
  setDateRange,
  setFilter,
  clearFilters,
  clearSuccess,
  clearError,
} from '@store/slices/reportSlice';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import Alert from '@components/common/Alert';
import Tabs from '@components/common/Tabs';
import ReportGenerator from '@components/reports/ReportGenerator';
import AttendanceReport from '@components/reports/AttendanceReport';
import VisitorReport from '@components/reports/VisitorReport';
import CameraUptimeReport from '@components/reports/CameraUptimeReport';
import SecurityReport from '@components/reports/SecurityReport';
import ConsolidatedReport from '@components/reports/ConsolidatedReport';

const ReportsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    selectedType,
    success,
    error,
  } = useAppSelector((state) => state.reports);

  const [activeTab, setActiveTab] = useState(selectedType);

  useEffect(() => {
    setActiveTab(selectedType);
  }, [selectedType]);

  // Auto-dismiss messages
  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => dispatch(clearSuccess()), 3000);
    return () => clearTimeout(timer);
  }, [success, dispatch]);

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => dispatch(clearError()), 3000);
    return () => clearTimeout(timer);
  }, [error, dispatch]);

  const tabs = [
    { id: 'attendance', label: 'Attendance Report' },
    { id: 'visitors', label: 'Visitor Report' },
    { id: 'camera_uptime', label: 'Camera Uptime' },
    { id: 'security_incidents', label: 'Security Incidents' },
    { id: 'consolidated', label: 'Consolidated Summary' },
  ];

  const handleTabChange = (tabId: string) => {
    const reportType = tabId as 'attendance' | 'visitors' | 'camera_uptime' | 'security_incidents' | 'consolidated';
    setActiveTab(reportType);
    dispatch(setReportType(reportType));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-900">
          Reports & Analytics
        </h1>
        <p className="text-gray-600 dark:text-slate-500 mt-1">
          Generate, analyze, and export comprehensive system reports
        </p>
      </div>

      {/* Alerts */}
      {success && (
        <Alert
          type="success"
          title="Success"
          message={success}
          onDismiss={() => dispatch(clearSuccess())}
        />
      )}
      {error && (
        <Alert
          type="error"
          title="Error"
          message={error}
          onDismiss={() => dispatch(clearError())}
        />
      )}

      {/* Report Generator */}
      <ReportGenerator />

      {/* Report Tabs */}
      <Card>
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </Card>

      {/* Report Content */}
      {activeTab === 'attendance' && <AttendanceReport />}
      {activeTab === 'visitors' && <VisitorReport />}
      {activeTab === 'camera_uptime' && <CameraUptimeReport />}
      {activeTab === 'security_incidents' && <SecurityReport />}
      {activeTab === 'consolidated' && <ConsolidatedReport />}
    </div>
  );
};

export default ReportsPage;
