import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@store/store';
import {
  fetchAlertsStart,
  fetchAlertsSuccess,
  fetchAlertsError,
  selectAlert,
  acknowledgeAlertStart,
  acknowledgeAlertSuccess,
  acknowledgeAlertError,
  addAlert,
  setFilter,
  setCurrentPage,
  setPageSize,
} from '@store/slices/alertSlice';
import { apiClient } from '@services/api';
import { Alert } from '@types/index';
import { POLL_INTERVAL_ALERTS } from '@utils/constants';

export const useAlerts = () => {
  const dispatch = useAppDispatch();
  const alerts = useAppSelector((state) => state.alerts.alerts);
  const selectedAlert = useAppSelector((state) => state.alerts.selectedAlert);
  const loading = useAppSelector((state) => state.alerts.loading);
  const error = useAppSelector((state) => state.alerts.error);
  const total = useAppSelector((state) => state.alerts.total);
  const currentPage = useAppSelector((state) => state.alerts.currentPage);
  const pageSize = useAppSelector((state) => state.alerts.pageSize);
  const filter = useAppSelector((state) => state.alerts.filter);

  const fetchAlerts = useCallback(
    async (page: number = 1, size: number = 20) => {
      dispatch(fetchAlertsStart());
      try {
        const response = await apiClient.getAlerts(page, size, filter);
        if (response.data.success) {
          dispatch(
            fetchAlertsSuccess({
              alerts: response.data.data.items || [],
              total: response.data.data.total || 0,
            })
          );
        }
      } catch (err) {
        dispatch(fetchAlertsError('Failed to fetch alerts'));
      }
    },
    [dispatch, filter]
  );

  const selectAlertById = useCallback(
    (alert: Alert | null) => {
      dispatch(selectAlert(alert));
    },
    [dispatch]
  );

  const acknowledgeAlert = useCallback(
    async (alertId: string) => {
      dispatch(acknowledgeAlertStart());
      try {
        await apiClient.acknowledgeAlert(alertId);
        dispatch(acknowledgeAlertSuccess(alertId));
      } catch (err) {
        dispatch(acknowledgeAlertError('Failed to acknowledge alert'));
      }
    },
    [dispatch]
  );

  const addNewAlert = useCallback(
    (alert: Alert) => {
      dispatch(addAlert(alert));
    },
    [dispatch]
  );

  const setAlertFilter = useCallback(
    (newFilter: any) => {
      dispatch(setFilter(newFilter));
    },
    [dispatch]
  );

  const changePage = useCallback(
    (page: number) => {
      dispatch(setCurrentPage(page));
      fetchAlerts(page, pageSize);
    },
    [dispatch, pageSize, fetchAlerts]
  );

  const changePageSize = useCallback(
    (size: number) => {
      dispatch(setPageSize(size));
      fetchAlerts(1, size);
    },
    [dispatch, fetchAlerts]
  );

  useEffect(() => {
    fetchAlerts(currentPage, pageSize);

    // Set up polling
    const interval = setInterval(() => {
      fetchAlerts(currentPage, pageSize);
    }, POLL_INTERVAL_ALERTS);

    return () => clearInterval(interval);
  }, [currentPage, pageSize, fetchAlerts]);

  return {
    alerts,
    selectedAlert,
    loading,
    error,
    total,
    currentPage,
    pageSize,
    filter,
    fetchAlerts,
    selectAlertById,
    acknowledgeAlert,
    addNewAlert,
    setAlertFilter,
    changePage,
    changePageSize,
  };
};
