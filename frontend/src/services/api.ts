import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiResponse, PaginatedResponse } from '@/types/index';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login or refresh token
          console.error('Unauthorized access');
        }
        return Promise.reject(error);
      }
    );
  }

  // Cameras
  async getCameras(page: number = 1, pageSize: number = 20) {
    return this.client.get<ApiResponse<PaginatedResponse<any>>>(
      `/cameras?page=${page}&page_size=${pageSize}`
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
