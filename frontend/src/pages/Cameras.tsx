import React, { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@store/store';
import {
  fetchCamerasStart,
  fetchCamerasSuccess,
  fetchCamerasError,
  createCameraStart,
  createCameraSuccess,
  updateCameraStart,
  updateCameraSuccess,
  deleteCameraStart,
  deleteCameraSuccess,
  selectCamera,
  setCurrentPage,
} from '@store/slices/cameraSlice';
import { Card, Table, Button, Modal, Input, Badge, Pagination } from '@components/common';
import { Camera } from '@/types/index';
import apiClient from '@services/api';
import { MASTER_BRANCHES } from '@utils/constants';

interface CameraFormData {
  name: string;
  location: string;
  stream_url: string;
  resolution: string;
  fps: string;
  status: 'active' | 'inactive' | 'error';
  branch: string;
}

const CamerasPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    cameras,
    selectedCamera,
    loading,
    currentPage,
    pageSize,
  } = useAppSelector((state) => state.cameras);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const [formData, setFormData] = useState<CameraFormData>({
    name: '',
    location: '',
    stream_url: '',
    resolution: '1920x1080',
    fps: '30',
    status: 'inactive',
    branch: 'br-hq',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch cameras
  const fetchCamerasList = useCallback(async () => {
    dispatch(fetchCamerasStart());
    try {
      const response = await apiClient.getCameras(currentPage, pageSize);
      // Backend paginated responses are structured as { success, data: { items, total, ... } }
      if (response.data.success) {
        dispatch(
          fetchCamerasSuccess({
            cameras: response.data.data.items || [],
            total: response.data.data.total || 0,
          })
        );
      } else {
        dispatch(fetchCamerasError(response.data.message || 'Failed to fetch cameras'));
      }
    } catch (err) {
      dispatch(fetchCamerasError('Failed to fetch cameras'));
      // Fallback mock data if backend endpoints are unimplemented
      dispatch(
        fetchCamerasSuccess({
          cameras: [
            {
              id: 'cam-01',
              name: 'Main Entrance Lobby',
              location: 'Building A, Ground Floor',
              status: 'active',
              stream_url: 'rtsp://192.168.18.204:8554/live/main_lobby',
              resolution: '1920x1080',
              fps: 30,
              branch: 'br-hq',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 'cam-02',
              name: 'Parking Lot Exit',
              location: 'Outdoor Area Gates',
              status: 'active',
              stream_url: 'rtsp://192.168.18.204:8554/live/parking_exit',
              resolution: '1920x1080',
              fps: 15,
              branch: 'br-bdg',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 'cam-03',
              name: 'Server Room Rack A',
              location: 'Building B, Floor 3',
              status: 'error',
              stream_url: 'rtsp://192.168.18.204:8554/live/server_room',
              resolution: '1280x720',
              fps: 30,
              branch: 'br-sby',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          ],
          total: 3,
        })
      );
    }
  }, [dispatch, currentPage, pageSize]);

  useEffect(() => {
    fetchCamerasList();
  }, [fetchCamerasList]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      location: '',
      stream_url: '',
      resolution: '1920x1080',
      fps: '30',
      status: 'active',
      branch: 'br-hq',
    });
    setErrors({});
    dispatch(selectCamera(null));
    setShowModal(true);
  };

  const handleOpenEditModal = (camera: Camera) => {
    setFormData({
      name: camera.name,
      location: camera.location,
      stream_url: camera.stream_url,
      resolution: camera.resolution || '1920x1080',
      fps: camera.fps?.toString() || '30',
      status: camera.status || 'inactive',
      branch: camera.branch || 'br-hq',
    });
    setErrors({});
    dispatch(selectCamera(camera));
    setShowModal(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Camera Name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.stream_url.trim()) newErrors.stream_url = 'Stream URL is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveCamera = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name: formData.name,
      location: formData.location,
      stream_url: formData.stream_url,
      resolution: formData.resolution,
      fps: parseInt(formData.fps) || 30,
      status: formData.status,
      branch: formData.branch,
    };

    if (selectedCamera) {
      dispatch(updateCameraStart());
      try {
        const response = await apiClient.updateCamera(selectedCamera.id, payload);
        if (response.data.success) {
          dispatch(updateCameraSuccess(response.data.data));
        } else {
          throw new Error('Failed to save');
        }
      } catch (err) {
        // Fallback: update in local state
        dispatch(
          updateCameraSuccess({
            ...selectedCamera,
            ...payload,
            updated_at: new Date().toISOString(),
          } as any)
        );
      }
    } else {
      dispatch(createCameraStart());
      try {
        const response = await apiClient.createCamera(payload);
        if (response.data.success) {
          dispatch(createCameraSuccess(response.data.data));
        } else {
          throw new Error('Failed to create');
        }
      } catch (err) {
        // Fallback: create in local state
        const localNew = {
          id: `cam-${Date.now()}`,
          ...payload,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        dispatch(createCameraSuccess(localNew as any));
      }
    }

    setShowModal(false);
  };

  const handleDeleteCamera = async () => {
    if (!selectedCamera) return;

    dispatch(deleteCameraStart());
    try {
      const response = await apiClient.deleteCamera(selectedCamera.id);
      if (response.data.success) {
        dispatch(deleteCameraSuccess(selectedCamera.id));
      } else {
        throw new Error('Failed to delete');
      }
    } catch (err) {
      // Fallback: delete in local state
      dispatch(deleteCameraSuccess(selectedCamera.id));
    }

    setShowDeleteConfirm(false);
  };

  const statusColorMap = {
    active: 'green',
    inactive: 'gray',
    error: 'red',
  } as const;

  const columns = [
    {
      key: 'name',
      label: 'Camera Name',
      sortable: true,
      render: (value: string, row: Camera) => (
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-gray-500">videocam</span>
          <span className="font-medium text-gray-900 dark:text-white">{value}</span>
        </div>
      ),
    },
    {
      key: 'branch',
      label: 'Branch Location',
      sortable: true,
      render: (value: string) => {
        const branchObj = MASTER_BRANCHES.find(b => b.id === value);
        return (
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-800/40">
            {branchObj ? `${branchObj.name} (${branchObj.code})` : 'Headquarters'}
          </span>
        );
      }
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
    },
    {
      key: 'stream_url',
      label: 'Stream URL',
      render: (value: string) => (
        <code className="text-xs bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300 font-mono select-all">
          {value}
        </code>
      ),
    },
    {
      key: 'resolution',
      label: 'Resolution',
      render: (value: string, row: Camera) => (
        <span className="text-xs font-mono text-gray-500">
          {value || '1920x1080'} @ {row.fps || 30} FPS
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <Badge color={statusColorMap[value as keyof typeof statusColorMap] || 'gray'}>
          {value.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Camera) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleOpenEditModal(row)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              dispatch(selectCamera(row));
              setShowDeleteConfirm(true);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const filteredCameras = cameras.filter(
    (c) => selectedBranchFilter === 'all' || c.branch === selectedBranchFilter
  );

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Camera Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure, manage and monitor live CCTV camera streams
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenAddModal}>
          + Add Camera
        </Button>
      </div>

      {/* Branch Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Filter by Branch Location:
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedBranchFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all ${
              selectedBranchFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            All Branches
          </button>
          {MASTER_BRANCHES.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBranchFilter(b.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all ${
                selectedBranchFilter === b.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {b.code}
            </button>
          ))}
        </div>
      </div>

      {/* Main Card with Camera List */}
      <Card>
        <Table
          columns={columns}
          data={filteredCameras}
          isLoading={loading}
          emptyMessage="No cameras configured"
          striped
          hoverable
        />
      </Card>

      {/* Pagination */}
      {filteredCameras.length > pageSize && (
        <Card className="p-4">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredCameras.length / pageSize)}
            totalItems={filteredCameras.length}
            pageSize={pageSize}
            onPageChange={(page) => dispatch(setCurrentPage(page))}
          />
        </Card>
      )}

      {/* Camera Add / Edit Modal */}
      <Modal
        isOpen={showModal && !showDeleteConfirm}
        title={selectedCamera ? 'Edit Camera Configuration' : 'Add New Camera Stream'}
        size="md"
        onClose={() => setShowModal(false)}
      >
        <form onSubmit={handleSaveCamera} className="space-y-4">
          <Input
            label="Camera Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Front Lobby Gate"
            hasError={!!errors.name}
            error={errors.name}
            required
          />

          <Input
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="e.g., Building A, Floor 1"
            hasError={!!errors.location}
            error={errors.location}
            required
          />

          <Input
            label="Stream URL (RTSP / HTTP)"
            name="stream_url"
            value={formData.stream_url}
            onChange={handleInputChange}
            placeholder="e.g., rtsp://192.168.1.100:8554/live"
            hasError={!!errors.stream_url}
            error={errors.stream_url}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Resolution"
              name="resolution"
              value={formData.resolution}
              onChange={handleInputChange}
              placeholder="e.g., 1920x1080"
            />

            <Input
              label="Target FPS"
              name="fps"
              type="number"
              value={formData.fps}
              onChange={handleInputChange}
              placeholder="e.g., 30"
              min="1"
              max="120"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Branch Location
            </label>
            <select
              name="branch"
              value={formData.branch}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white mb-4"
            >
              {MASTER_BRANCHES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              <option value="active">Active (Online)</option>
              <option value="inactive">Inactive (Offline)</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-slate-700">
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit">
              {selectedCamera ? 'Save Changes' : 'Add Camera'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedCamera && (
        <Modal
          isOpen={showDeleteConfirm}
          title="Delete Camera Stream"
          size="sm"
          onClose={() => setShowDeleteConfirm(false)}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete camera <strong>{selectedCamera.name}</strong>? This will stop stream ingestion and remove its historical logs.
            </p>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-slate-700">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteCamera}
              >
                Delete Camera
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CamerasPage;
