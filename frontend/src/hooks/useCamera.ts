import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@store/store';
import {
  fetchCamerasStart,
  fetchCamerasSuccess,
  fetchCamerasError,
  selectCamera,
  deleteCameraStart,
  deleteCameraSuccess,
  deleteCameraError,
  setCurrentPage,
  setPageSize,
} from '@store/slices/cameraSlice';
import { apiClient } from '@services/api';
import { Camera } from '@/types/index';

export const useCamera = () => {
  const dispatch = useAppDispatch();
  const cameras = useAppSelector((state) => state.cameras.cameras);
  const selectedCamera = useAppSelector((state) => state.cameras.selectedCamera);
  const loading = useAppSelector((state) => state.cameras.loading);
  const error = useAppSelector((state) => state.cameras.error);
  const total = useAppSelector((state) => state.cameras.total);
  const currentPage = useAppSelector((state) => state.cameras.currentPage);
  const pageSize = useAppSelector((state) => state.cameras.pageSize);

  const fetchCameras = useCallback(
    async (page: number = 1, size: number = 20) => {
      dispatch(fetchCamerasStart());
      try {
        const response = await apiClient.getCameras(page, size);
        if (response.data.success) {
          dispatch(
            fetchCamerasSuccess({
              cameras: response.data.data.items || [],
              total: response.data.data.total || 0,
            })
          );
        }
      } catch (err) {
        dispatch(fetchCamerasError('Failed to fetch cameras'));
      }
    },
    [dispatch]
  );

  const selectCameraById = useCallback(
    (camera: Camera | null) => {
      dispatch(selectCamera(camera));
    },
    [dispatch]
  );

  const deleteCamera = useCallback(
    async (cameraId: string) => {
      dispatch(deleteCameraStart());
      try {
        await apiClient.deleteCamera(cameraId);
        dispatch(deleteCameraSuccess(cameraId));
      } catch (err) {
        dispatch(deleteCameraError('Failed to delete camera'));
      }
    },
    [dispatch]
  );

  const changePage = useCallback(
    (page: number) => {
      dispatch(setCurrentPage(page));
      fetchCameras(page, pageSize);
    },
    [dispatch, pageSize, fetchCameras]
  );

  const changePageSize = useCallback(
    (size: number) => {
      dispatch(setPageSize(size));
      fetchCameras(1, size);
    },
    [dispatch, fetchCameras]
  );

  useEffect(() => {
    fetchCameras(currentPage, pageSize);
  }, []);

  return {
    cameras,
    selectedCamera,
    loading,
    error,
    total,
    currentPage,
    pageSize,
    fetchCameras,
    selectCameraById,
    deleteCamera,
    changePage,
    changePageSize,
  };
};
