// API Configuration
const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return `${window.location.protocol}//${window.location.host}/api`;
    }
  }
  return 'http://localhost:8000/api';
};

const getWsUrl = () => {
  if (process.env.REACT_APP_WS_URL) {
    return process.env.REACT_APP_WS_URL;
  }
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${wsProtocol}//${window.location.host}/ws`;
    }
  }
  return 'ws://localhost:8000/ws';
};

export const API_BASE_URL = getApiBaseUrl();
export const WS_URL = getWsUrl();

// Alert Types
export const ALERT_TYPES = {
  MATCH: 'match',
  UNKNOWN_FACE: 'unknown_face',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  SYSTEM_ERROR: 'system_error',
} as const;

// Alert Severities
export const ALERT_SEVERITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

// Camera Status
export const CAMERA_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ERROR: 'error',
} as const;

// Person Status
export const PERSON_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  WATCHLIST: 'watchlist',
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Time Format
export const DATE_FORMAT = 'MMM dd, yyyy';
export const TIME_FORMAT = 'HH:mm:ss';
export const DATE_TIME_FORMAT = 'MMM dd, yyyy HH:mm:ss';

// Polling intervals (in ms)
export const POLL_INTERVAL_DASHBOARD = 30000; // 30 seconds
export const POLL_INTERVAL_ALERTS = 10000; // 10 seconds
export const POLL_INTERVAL_CAMERAS = 60000; // 1 minute

// File upload
export const MAX_FILE_SIZE = 52428800; // 50MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

// Chart colors
export const CHART_COLORS = {
  primary: '#0ea5e9',
  success: '#22c55e',
  warning: '#eab308',
  danger: '#ef4444',
  secondary: '#64748b',
} as const;
