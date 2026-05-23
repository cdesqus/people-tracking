/**
 * Dashboard-specific types for real-time data and components
 */

export interface DashboardKPIs {
  occupancy: number;
  activeCameras: number;
  activeCamerasTotal: number;
  activeAlerts: number;
  currentVisitors: number;
  timestamp: string;
}

export interface CameraStatus extends Record<string, any> {
  id: string;
  name: string;
  isOnline: boolean;
  location: string;
  lastDetection?: string;
  detectionCount: number;
  status: 'active' | 'inactive' | 'error';
}

export interface DetectionRecord {
  id: string;
  personId?: string;
  personName: string;
  cameraId: string;
  cameraName: string;
  confidence: number;
  timestamp: string;
}

export interface AlertRecord {
  id: string;
  type: 'match' | 'unknown_face' | 'suspicious_activity' | 'system_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  cameraId: string;
  cameraName?: string;
  personId?: string;
  personName?: string;
  acknowledged: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardUpdate {
  type: 'kpi' | 'detection' | 'alert' | 'camera_status';
  data: any;
  timestamp: string;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}
