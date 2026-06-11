/**
 * Custom hook for managing dashboard real-time data via WebSocket + API
 * Handles initial data loading and real-time updates
 */

import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@store/store';
import {
  fetchCamerasStart,
  fetchCamerasSuccess,
  fetchCamerasError,
  updateCameraSuccess,
} from '@store/slices/cameraSlice';
import {
  fetchAlertsStart,
  fetchAlertsSuccess,
  fetchAlertsError,
  addAlert,
} from '@store/slices/alertSlice';
import {
  fetchFacesStart,
  fetchFacesSuccess,
  fetchFacesError,
} from '@store/slices/faceSlice';
import { Camera, Face, Alert } from '@/types/index';
import { WS_URL } from '@utils/constants';

interface UseDashboardDataOptions {
  autoConnect?: boolean;
  kpiUpdateInterval?: number; // ms
  detectionUpdateInterval?: number; // ms
}

export const useDashboardData = (options: UseDashboardDataOptions = {}) => {
  const {
    autoConnect = true,
    kpiUpdateInterval = 5000,
    detectionUpdateInterval = 10000,
  } = options;

  const dispatch = useAppDispatch();
  const wsRef = useRef<WebSocket | null>(null);
  const kpiTimerRef = useRef<NodeJS.Timeout | null>(null);
  const detectionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const cameras = useAppSelector((state) => state.cameras.cameras);
  const alerts = useAppSelector((state) => state.alerts.alerts);
  const faces = useAppSelector((state) => state.faces.faces);

  const isConnected = useRef(false);

  /**
   * Fetch initial data from API
   */
  const fetchInitialData = useCallback(async () => {
    try {
      // Fetch cameras
      dispatch(fetchCamerasStart());
      const camerasRes = await fetch('/api/cameras/');
      if (camerasRes.ok) {
        const data = await camerasRes.json();
        const camerasList = data.success && data.data ? (data.data.items || data.data) : (data.items || data);
        const totalCount = data.success && data.data ? (data.data.total ?? (Array.isArray(camerasList) ? camerasList.length : 0)) : (data.total ?? (Array.isArray(data) ? data.length : 0));
        dispatch(fetchCamerasSuccess({
          cameras: Array.isArray(camerasList) ? camerasList : [],
          total: totalCount,
        }));
      } else {
        dispatch(fetchCamerasError('Failed to fetch cameras'));
      }

      // Fetch alerts
      dispatch(fetchAlertsStart());
      const alertsRes = await fetch('/api/alerts/?limit=20');
      if (alertsRes.ok) {
        const data = await alertsRes.json();
        dispatch(fetchAlertsSuccess({
          alerts: data.items || data,
          total: data.total || (Array.isArray(data) ? data.length : 0),
        }));
      } else {
        dispatch(fetchAlertsError('Failed to fetch alerts'));
      }

      // Fetch recent detections
      dispatch(fetchFacesStart());
      const detectionsRes = await fetch('/api/detections/?limit=20');
      if (detectionsRes.ok) {
        const data = await detectionsRes.json();
        dispatch(fetchFacesSuccess({
          faces: data.items || data,
          total: data.total || (Array.isArray(data) ? data.length : 0),
        }));
      } else {
        dispatch(fetchFacesError('Failed to fetch detections'));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      dispatch(fetchCamerasError('Network error'));
      dispatch(fetchAlertsError('Network error'));
      dispatch(fetchFacesError('Network error'));
    }
  }, [dispatch]);

  /**
   * Connect to WebSocket for real-time updates
   */
  const connectWebSocket = useCallback(() => {
    if (isConnected.current && wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = `${WS_URL}/dashboard`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Dashboard WebSocket connected');
        isConnected.current = true;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        isConnected.current = false;
      };

      wsRef.current.onclose = () => {
        console.log('Dashboard WebSocket disconnected');
        isConnected.current = false;
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  }, []);

  /**
   * Handle incoming WebSocket messages
   */
  const handleWebSocketMessage = useCallback((message: any) => {
    const { type, data } = message;

    switch (type) {
      case 'camera_status_update':
        dispatch(updateCameraSuccess(data as Camera));
        break;
      case 'new_alert':
        dispatch(addAlert(data as Alert));
        fetchInitialData();
        break;
      case 'new_detection':
        fetchInitialData();
        break;
      case 'kpi_update':
        // KPIs handled separately, just log
        console.log('KPI update:', data);
        break;
      default:
        console.log('Unknown message type:', type);
    }
  }, [dispatch, fetchInitialData]);

  /**
   * Disconnect WebSocket
   */
  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      isConnected.current = false;
    }
  }, []);

  /**
   * Initialize data and WebSocket connection
   */
  useEffect(() => {
    if (!autoConnect) return;

    // Fetch initial data
    fetchInitialData();

    // Connect to WebSocket
    connectWebSocket();

    // Cleanup
    return () => {
      disconnectWebSocket();
      if (kpiTimerRef.current) clearTimeout(kpiTimerRef.current);
      if (detectionTimerRef.current) clearTimeout(detectionTimerRef.current);
    };
  }, [autoConnect, fetchInitialData, connectWebSocket, disconnectWebSocket]);

  /**
   * Send message through WebSocket
   */
  const sendMessage = useCallback((type: string, data?: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, data, timestamp: new Date().toISOString() }));
    } else {
      console.warn('WebSocket not connected');
    }
  }, []);

  return {
    cameras,
    alerts,
    faces,
    isConnected: isConnected.current,
    sendMessage,
    reconnect: connectWebSocket,
    disconnect: disconnectWebSocket,
  };
};
