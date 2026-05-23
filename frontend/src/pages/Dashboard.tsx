/**
 * Main Dashboard Page
 * Displays real-time CCTV system overview with KPIs, cameras, detections, and alerts
 */

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@store/store';
import { useDashboardData } from '@hooks/useDashboardData';
import DashboardOverview from '@components/dashboard/DashboardOverview';
import CameraGrid from '@components/dashboard/CameraGrid';
import RecentDetections from '@components/dashboard/RecentDetections';
import AlertPanel from '@components/dashboard/AlertPanel';
import Alert from '@components/common/Alert';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import { acknowledgeAlertStart, acknowledgeAlertSuccess } from '@store/slices/alertSlice';
import { CameraStatus } from '@/types/dashboard';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const [kpiStats, setKpiStats] = useState({
    occupancy: 0,
    activeCameras: 0,
    totalCameras: 0,
    activeAlerts: 0,
    currentVisitors: 0,
  });

  // Use the custom hook for WebSocket + API integration
  const { cameras, alerts, faces, isConnected, sendMessage } = useDashboardData({
    autoConnect: true,
  });

  const camerasLoading = useAppSelector((state) => state.cameras.loading);
  const alertsLoading = useAppSelector((state) => state.alerts.loading);
  const facesLoading = useAppSelector((state) => state.faces.loading);

  // Update KPI stats
  useEffect(() => {
    const activeCameraCount = cameras.filter(
      (c: any) => c.status === 'active' || c.isOnline === true
    ).length;
    const activeAlertCount = alerts.filter((a: any) => !a.acknowledged).length;
    const knownPersons = new Set(
      faces
        .filter((f: any) => f.person_id)
        .map((f: any) => f.person_id)
    ).size;

    setKpiStats({
      occupancy: faces.length,
      activeCameras: activeCameraCount,
      totalCameras: cameras.length,
      activeAlerts: activeAlertCount,
      currentVisitors: knownPersons,
    });
  }, [cameras, alerts, faces]);

  // Convert cameras to CameraStatus format
  const cameraStatuses: CameraStatus[] = cameras.map((camera: any) => ({
    id: camera.id,
    name: camera.name,
    isOnline: camera.status === 'active',
    location: camera.location || `Location ${camera.id}`,
    lastDetection: undefined,
    detectionCount: 0,
    status: camera.status || 'inactive',
  }));

  // Handle alert acknowledgment
  const handleAcknowledgeAlert = async (alertId: string) => {
    dispatch(acknowledgeAlertStart());
    try {
      const response = await fetch(`/api/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        dispatch(acknowledgeAlertSuccess(alertId));
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  // Handle camera click
  const handleCameraClick = (camera: CameraStatus) => {
    console.log('Camera clicked:', camera);
    // Could navigate to camera detail or open a modal
    sendMessage('camera_selected', { cameraId: camera.id });
  };

  // Handle detection click
  const handleDetectionClick = (detection: any) => {
    console.log('Detection clicked:', detection);
    // Could navigate to detection detail
  };

  // Handle alert click
  const handleAlertClick = (alert: any) => {
    console.log('Alert clicked:', alert);
    // Could navigate to alert detail
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Real-time CCTV System Overview
            </p>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                isConnected
                  ? 'bg-green-500 animate-pulse'
                  : 'bg-red-500'
              }`}
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isConnected ? 'Connected' : 'Reconnecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Connection Alert */}
        {!isConnected && (
          <Alert
            type="warning"
            title="Connection Lost"
            message="Real-time updates are temporarily unavailable. Reconnecting..."
            dismissible={false}
          />
        )}

        {/* KPI Overview Cards */}
        <DashboardOverview
          occupancy={kpiStats.occupancy}
          activeCameras={kpiStats.activeCameras}
          totalCameras={kpiStats.totalCameras}
          activeAlerts={kpiStats.activeAlerts}
          currentVisitors={kpiStats.currentVisitors}
          loading={camerasLoading || alertsLoading || facesLoading}
        />

        {/* Main Grid - Cameras and Alerts Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Grid - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <CameraGrid
              cameras={cameraStatuses}
              loading={camerasLoading}
              onCameraClick={handleCameraClick}
              maxCameras={12}
            />
          </div>

          {/* Alert Panel - Takes 1 column on large screens */}
          <div className="lg:col-span-1">
            <AlertPanel
              alerts={alerts}
              loading={alertsLoading}
              onAlertClick={handleAlertClick}
              onAcknowledge={handleAcknowledgeAlert}
            />
          </div>
        </div>

        {/* Recent Detections Table */}
        <div>
          <RecentDetections
            detections={faces}
            loading={facesLoading}
            onDetectionClick={handleDetectionClick}
          />
        </div>

        {/* System Status Footer */}
        <Card title="System Status" subtitle="Last 24 hours">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Uptime
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                99.9%
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Avg Response
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                127ms
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Detections
              </p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {faces.length}
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                API Health
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                Healthy
              </p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" size="sm">
              Export Report
            </Button>
            <Button variant="secondary" size="sm">
              View Analytics
            </Button>
            <Button variant="secondary" size="sm">
              Settings
            </Button>
            <Button variant="secondary" size="sm">
              Help
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
