// API Configuration
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      const port = window.location.port === '3000' ? '8000' : window.location.port;
      const host = port ? `${window.location.hostname}:${port}` : window.location.hostname;
      return `${window.location.protocol}//${host}/api`;
    }
  }
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  return 'http://localhost:8000/api';
};

const getWsUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const port = window.location.port === '3000' ? '8000' : window.location.port;
      const host = port ? `${window.location.hostname}:${port}` : window.location.hostname;
      return `${wsProtocol}//${host}/ws`;
    }
  }
  if (process.env.REACT_APP_WS_URL) {
    return process.env.REACT_APP_WS_URL;
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
  INTRUSION: 'intrusion',
  SYSTEM_ERROR: 'system_error',
} as const;

// Alert Severities
export const ALERT_SEVERITIES = {
  INFO: 'info',
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

// Branch Master Data
export interface Branch {
  id: string;
  name: string;
  city: string;
  code: string;
}

export const MASTER_BRANCHES: Branch[] = [
  { id: 'br-hq', name: 'Headquarters (Jakarta)', city: 'Jakarta', code: 'JKT-HQ' },
  { id: 'br-bdg', name: 'Bandung Branch', city: 'Bandung', code: 'BDG-01' },
  { id: 'br-sby', name: 'Surabaya Branch', city: 'Surabaya', code: 'SBY-02' },
  { id: 'br-mdn', name: 'Medan Branch', city: 'Medan', code: 'MDN-03' },
  { id: 'br-ygk', name: 'Yogyakarta Branch', city: 'Yogyakarta', code: 'YGK-04' },
];
