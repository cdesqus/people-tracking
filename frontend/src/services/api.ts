import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiResponse, PaginatedResponse } from '@/types/index';

import { API_BASE_URL } from '../utils/constants';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to attach bearer token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Skip auto-redirect for /me endpoint — App.tsx handles session restore itself.
          const requestUrl = error.config?.url || '';
          if (!requestUrl.includes('/auth/me')) {
            console.error('Unauthorized access - clearing tokens and redirecting');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Cameras
  async getCameras(page: number = 1, pageSize: number = 20) {
    return this.client.get<ApiResponse<PaginatedResponse<any>>>(
      `/cameras/?page=${page}&page_size=${pageSize}`
    );
  }

  async getCamera(id: string) {
    return this.client.get<ApiResponse<any>>(`/cameras/${id}`);
  }

  async createCamera(data: any) {
    return this.client.post<ApiResponse<any>>('/cameras', data);
  }

  async updateCamera(id: string, data: any) {
    return this.client.put<ApiResponse<any>>(`/cameras/${id}`, data);
  }

  async deleteCamera(id: string) {
    return this.client.delete<ApiResponse<any>>(`/cameras/${id}`);
  }

  // Faces
  async getFaces(page: number = 1, pageSize: number = 20) {
    return this.client.get<ApiResponse<PaginatedResponse<any>>>(
      `/faces?page=${page}&page_size=${pageSize}`
    );
  }

  async getFacesByCamera(cameraId: string, page: number = 1) {
    return this.client.get<ApiResponse<PaginatedResponse<any>>>(
      `/cameras/${cameraId}/faces?page=${page}`
    );
  }

  async getFace(id: string) {
    return this.client.get<ApiResponse<any>>(`/faces/${id}`);
  }

  // Persons
  async getPersons(page: number = 1, pageSize: number = 20) {
    return this.client.get<ApiResponse<PaginatedResponse<any>>>(
      `/persons?page=${page}&page_size=${pageSize}`
    );
  }

  async getPerson(id: string) {
    return this.client.get<ApiResponse<any>>(`/persons/${id}`);
  }

  async createPerson(data: any) {
    return this.client.post<ApiResponse<any>>('/persons', data);
  }

  async updatePerson(id: string, data: any) {
    return this.client.put<ApiResponse<any>>(`/persons/${id}`, data);
  }

  async deletePerson(id: string) {
    return this.client.delete<ApiResponse<any>>(`/persons/${id}`);
  }

  // Alerts
  async getAlerts(page: number = 1, pageSize: number = 20, filter?: any) {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (filter?.type) params.append('type', filter.type);
    if (filter?.severity) params.append('severity', filter.severity);
    if (filter?.camera_id) params.append('camera_id', filter.camera_id);

    return this.client.get<ApiResponse<PaginatedResponse<any>>>(
      `/alerts?${params.toString()}`
    );
  }

  async getAlert(id: string) {
    return this.client.get<ApiResponse<any>>(`/alerts/${id}`);
  }

  async acknowledgeAlert(id: string) {
    return this.client.patch<ApiResponse<any>>(`/alerts/${id}/acknowledge`);
  }

  async deleteAlert(id: string) {
    return this.client.delete<ApiResponse<any>>(`/alerts/${id}`);
  }

  // Dashboard
  async getDashboardStats() {
    return this.client.get<ApiResponse<any>>('/dashboard/stats');
  }

  async getAnalytics(startDate: string, endDate: string) {
    return this.client.get<ApiResponse<any>>(
      `/analytics?start_date=${startDate}&end_date=${endDate}`
    );
  }

  // Reports & Analytics
  async getAttendanceReport(fromDate: string, toDate: string) {
    return this.client.get<ApiResponse<any>>(`/reports/attendance?from=${fromDate}&to=${toDate}`);
  }

  async getVisitorsReport(fromDate: string, toDate: string) {
    return this.client.get<ApiResponse<any>>(`/reports/visitors?from=${fromDate}&to=${toDate}`);
  }

  async getCameraUptimeReport() {
    return this.client.get<ApiResponse<any>>(`/reports/camera-uptime`);
  }

  async getSecurityIncidentsReport(fromDate: string, toDate: string) {
    return this.client.get<ApiResponse<any>>(`/reports/security-incidents?from=${fromDate}&to=${toDate}`);
  }

  async getConsolidatedReport(fromDate: string, toDate: string) {
    return this.client.get<ApiResponse<any>>(`/reports/consolidated?from=${fromDate}&to=${toDate}`);
  }

  // Authentication
  async login(data: any) {
    return this.client.post<ApiResponse<any>>('/auth/login', data);
  }

  async getCurrentUser() {
    return this.client.get<ApiResponse<any>>('/auth/me');
  }

  async refreshToken(refreshToken: string) {
    return this.client.post<ApiResponse<any>>('/auth/refresh-token', {
      refresh_token: refreshToken,
    });
  }

  // System
  async getSystemConfig() {
    return this.client.get<ApiResponse<any>>('/system/config');
  }

  async getSystemHealth() {
    return this.client.get<ApiResponse<any>>('/system/health');
  }

  // Utility
  getClient() {
    return this.client;
  }

  setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }
}

export const apiClient = new ApiClient();
export default apiClient;
