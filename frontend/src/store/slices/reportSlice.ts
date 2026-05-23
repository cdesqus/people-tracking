import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AttendanceRecord {
  employeeId: string;
  employeeName: string;
  checkIn: string;
  checkOut: string;
  duration: number;
  status: 'present' | 'absent' | 'late' | 'early_leave';
}

export interface VisitorRecord {
  visitorId: string;
  visitorName: string;
  organization: string;
  checkIn: string;
  checkOut: string;
  duration: number;
  hostName: string;
}

export interface CameraUptimeRecord {
  cameraId: string;
  cameraName: string;
  location: string;
  uptimePercent: number;
  lastOffline: string | null;
  offlineDuration: number;
}

export interface SecurityIncident {
  id: string;
  type: string;
  timestamp: string;
  cameraId: string;
  cameraName: string;
  description: string;
  resolved: boolean;
  severity: 'critical' | 'warning' | 'info';
}

export interface ReportData {
  type: 'attendance' | 'visitors' | 'camera_uptime' | 'security_incidents';
  fromDate: string;
  toDate: string;
  summary: Record<string, number>;
  details: any[];
}

interface ReportState {
  selectedType: 'attendance' | 'visitors' | 'camera_uptime' | 'security_incidents';
  fromDate: Date | null;
  toDate: Date | null;
  reportData: ReportData | null;
  loading: boolean;
  error: string | null;
  success: string | null;
  filters: {
    department?: string;
    employee?: string;
    camera?: string;
    organization?: string;
    severity?: string;
  };
  attendanceData: AttendanceRecord[];
  visitorData: VisitorRecord[];
  cameraUptimeData: CameraUptimeRecord[];
  securityIncidentData: SecurityIncident[];
  attendanceSummary: {
    present: number;
    absent: number;
    late: number;
    earlyLeave: number;
  };
  visitorSummary: {
    totalVisitors: number;
    avgDuration: number;
    topHosts: string[];
  };
  cameraUptimeSummary: {
    avgUptime: number;
    onlineCameras: number;
    offlineIncidents: number;
  };
  securitySummary: {
    total: number;
    critical: number;
    warnings: number;
    info: number;
  };
  reportView: 'daily' | 'weekly' | 'monthly';
}

const initialState: ReportState = {
  selectedType: 'attendance',
  fromDate: null,
  toDate: null,
  reportData: null,
  loading: false,
  error: null,
  success: null,
  filters: {},
  attendanceData: [],
  visitorData: [],
  cameraUptimeData: [],
  securityIncidentData: [],
  attendanceSummary: {
    present: 0,
    absent: 0,
    late: 0,
    earlyLeave: 0,
  },
  visitorSummary: {
    totalVisitors: 0,
    avgDuration: 0,
    topHosts: [],
  },
  cameraUptimeSummary: {
    avgUptime: 0,
    onlineCameras: 0,
    offlineIncidents: 0,
  },
  securitySummary: {
    total: 0,
    critical: 0,
    warnings: 0,
    info: 0,
  },
  reportView: 'daily',
};

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setReportType: (
      state,
      action: PayloadAction<'attendance' | 'visitors' | 'camera_uptime' | 'security_incidents'>
    ) => {
      state.selectedType = action.payload;
    },
    setDateRange: (
      state,
      action: PayloadAction<{ fromDate: Date; toDate: Date }>
    ) => {
      state.fromDate = action.payload.fromDate;
      state.toDate = action.payload.toDate;
    },
    setFilter: (
      state,
      action: PayloadAction<{ key: string; value: string }>
    ) => {
      state.filters[action.payload.key as keyof typeof state.filters] =
        action.payload.value;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setReportView: (state, action: PayloadAction<'daily' | 'weekly' | 'monthly'>) => {
      state.reportView = action.payload;
    },
    // Attendance Report
    fetchAttendanceStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAttendanceSuccess: (
      state,
      action: PayloadAction<{
        records: AttendanceRecord[];
        summary: {
          present: number;
          absent: number;
          late: number;
          earlyLeave: number;
        };
      }>
    ) => {
      state.loading = false;
      state.attendanceData = action.payload.records;
      state.attendanceSummary = action.payload.summary;
    },
    fetchAttendanceError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    // Visitor Report
    fetchVisitorsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchVisitorsSuccess: (
      state,
      action: PayloadAction<{
        records: VisitorRecord[];
        summary: {
          totalVisitors: number;
          avgDuration: number;
          topHosts: string[];
        };
      }>
    ) => {
      state.loading = false;
      state.visitorData = action.payload.records;
      state.visitorSummary = action.payload.summary;
    },
    fetchVisitorsError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    // Camera Uptime Report
    fetchCameraUptimeStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCameraUptimeSuccess: (
      state,
      action: PayloadAction<{
        records: CameraUptimeRecord[];
        summary: {
          avgUptime: number;
          onlineCameras: number;
          offlineIncidents: number;
        };
      }>
    ) => {
      state.loading = false;
      state.cameraUptimeData = action.payload.records;
      state.cameraUptimeSummary = action.payload.summary;
    },
    fetchCameraUptimeError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    // Security Incidents Report
    fetchSecurityStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSecuritySuccess: (
      state,
      action: PayloadAction<{
        records: SecurityIncident[];
        summary: {
          total: number;
          critical: number;
          warnings: number;
          info: number;
        };
      }>
    ) => {
      state.loading = false;
      state.securityIncidentData = action.payload.records;
      state.securitySummary = action.payload.summary;
    },
    fetchSecurityError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    // Export
    exportReportStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    exportReportSuccess: (state) => {
      state.loading = false;
      state.success = 'Report exported successfully';
    },
    exportReportError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setReportType,
  setDateRange,
  setFilter,
  clearFilters,
  setReportView,
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
  exportReportStart,
  exportReportSuccess,
  exportReportError,
  clearSuccess,
  clearError,
} = reportSlice.actions;

export default reportSlice.reducer;
