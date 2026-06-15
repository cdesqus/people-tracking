export interface Camera {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive' | 'error';
  stream_url: string;
  resolution: string;
  fps: number;
  branch?: string;
  intrusion_zones?: string;
  created_at: string;
  updated_at: string;
}

export interface Face {
  id: string;
  camera_id: string;
  person_id?: string;
  confidence: number;
  face_match?: string;
  boundingbox: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  timestamp: string;
  image_url: string;
}

export interface Alert {
  id: string;
  type: 'match' | 'unknown_face' | 'suspicious_activity' | 'system_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  camera_id: string;
  person_id?: string;
  face_id?: string;
  acknowledged: boolean;
  has_image?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Person {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'watchlist';
  face_encodings: string[];
  first_seen: string;
  last_seen: string;
  encounter_count: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_cameras: number;
  active_cameras: number;
  total_faces_today: number;
  total_alerts_today: number;
  unique_persons_today: number;
  system_health: number;
}

export interface AnalyticsData {
  date: string;
  faces_detected: number;
  alerts_triggered: number;
  unique_persons: number;
  camera_uptime: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: 'admin' | 'manager' | 'operator' | 'security' | 'receptionist' | 'viewer';
  created_at: string;
}

export interface SystemConfig {
  app_name: string;
  app_version: string;
  debug: boolean;
  max_faces_per_image: number;
  confidence_threshold: number;
  alert_retention_days: number;
}
