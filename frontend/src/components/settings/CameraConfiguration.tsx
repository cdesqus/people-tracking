/**
 * Camera Configuration Component
 * Manage cameras and test connections
 */

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@store/store';
import {
  setSelectedCamera,
  setShowCameraModal,
  createCameraStart,
  createCameraSuccess,
  createCameraError,
  updateCameraStart,
  updateCameraSuccess,
  updateCameraError,
  deleteCameraStart,
  deleteCameraSuccess,
  deleteCameraError,
} from '@store/slices/settingsSlice';
import { Camera } from '@store/slices/settingsSlice';
import Card from '@components/common/Card';
import Table from '@components/common/Table';
import Button from '@components/common/Button';
import Modal from '@components/common/Modal';
import Input from '@components/common/Input';
import Select from '@components/common/Select';
import Badge from '@components/common/Badge';

const CameraConfiguration: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    cameras,
    loading,
    showCameraModal,
    selectedCamera,
  } = useAppSelector((state) => state.settings);

  const [formData, setFormData] = useState<Partial<Camera>>({
    name: '',
    location: '',
    type: 'ip',
    resolution: '1920x1080',
    fps: 30,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  const handleCreateCamera = () => {
    setFormData({
      name: '',
      location: '',
      type: 'ip',
      resolution: '1920x1080',
      fps: 30,
    });
    dispatch(setSelectedCamera(null));
    dispatch(setShowCameraModal(true));
  };

  const handleEditCamera = (camera: Camera) => {
    setFormData(camera);
    dispatch(setSelectedCamera(camera));
    dispatch(setShowCameraModal(true));
  };

  const handleSaveCamera = async () => {
    if (!formData.name || !formData.location) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (selectedCamera) {
        dispatch(updateCameraStart());
        const response = await fetch(`/api/cameras/${selectedCamera.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Failed to update camera');
        const data = await response.json();
        dispatch(updateCameraSuccess(data));
      } else {
        dispatch(createCameraStart());
        const response = await fetch('/api/cameras', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Failed to create camera');
        const data = await response.json();
        dispatch(createCameraSuccess(data));
      }

      dispatch(setShowCameraModal(false));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error saving camera';
      selectedCamera
        ? dispatch(updateCameraError(message))
        : dispatch(createCameraError(message));
    }
  };

  const handleTestConnection = async () => {
    if (!selectedCamera) return;

    setTestingConnection(true);
    try {
      const response = await fetch(`/api/cameras/${selectedCamera.id}/test-connection`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Camera connection test successful!');
      } else {
        alert('Camera connection test failed. Please check the camera settings.');
      }
    } catch (error) {
      alert('Error testing camera connection');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleDeleteCamera = async () => {
    if (!selectedCamera) return;

    try {
      dispatch(deleteCameraStart());
      const response = await fetch(`/api/cameras/${selectedCamera.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete camera');

      dispatch(deleteCameraSuccess(selectedCamera.id));
      setShowDeleteConfirm(false);
      dispatch(setShowCameraModal(false));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error deleting camera';
      dispatch(deleteCameraError(message));
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Camera Name',
      sortable: true,
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <Badge className={`${
          value === 'online'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {value.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value: string) => <Badge>{value.toUpperCase()}</Badge>,
    },
    {
      key: 'resolution',
      label: 'Resolution',
      sortable: false,
      render: (value?: string) => <span>{value || 'N/A'}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Camera) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEditCamera(row)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              dispatch(setSelectedCamera(row));
              setShowDeleteConfirm(true);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card title="Camera Configuration" subtitle="Add and manage cameras">
        <div className="mb-6">
          <Button onClick={handleCreateCamera}>
            Add New Camera
          </Button>
        </div>

        <Table
          columns={columns}
          data={cameras}
          isLoading={loading}
          emptyMessage="No cameras configured"
          striped
          hoverable
        />
      </Card>

      {/* Camera Modal */}
      <Modal
        isOpen={showCameraModal && !showDeleteConfirm}
        title={selectedCamera ? 'Edit Camera' : 'Add New Camera'}
        size="md"
        onClose={() => dispatch(setShowCameraModal(false))}
      >
        <div className="p-6 space-y-4">
          <Input
            label="Camera Name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Front Door"
            required
          />

          <Input
            label="Location"
            value={formData.location || ''}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., Building A, Floor 2"
            required
          />

          <Select
            label="Camera Type"
            value={formData.type || 'ip'}
            onChange={(value) =>
              setFormData({ ...formData, type: value as string })
            }
            options={[
              { value: 'ip', label: 'IP Camera' },
              { value: 'analog', label: 'Analog' },
              { value: 'hdcvi', label: 'HDCVI' },
              { value: 'usb', label: 'USB' },
            ]}
          />

          <Input
            label="Resolution"
            value={formData.resolution || ''}
            onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
            placeholder="e.g., 1920x1080"
          />

          <Input
            label="FPS"
            type="number"
            value={formData.fps || ''}
            onChange={(e) => setFormData({ ...formData, fps: parseInt(e.target.value) })}
            placeholder="e.g., 30"
            min="1"
            max="120"
          />

          <div className="flex gap-3 justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              {selectedCamera && (
                <Button
                  variant="secondary"
                  onClick={handleTestConnection}
                  isLoading={testingConnection}
                  disabled={loading}
                >
                  Test Connection
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => dispatch(setShowCameraModal(false))}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveCamera}
                isLoading={loading}
              >
                {selectedCamera ? 'Update Camera' : 'Add Camera'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      {showDeleteConfirm && selectedCamera && (
        <Modal
          isOpen={showDeleteConfirm}
          title="Confirm Delete"
          size="sm"
          onClose={() => setShowDeleteConfirm(false)}
        >
          <div className="p-6 space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete camera <strong>{selectedCamera.name}</strong>?
              This action cannot be undone.
            </p>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteCamera}
                isLoading={loading}
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

export default CameraConfiguration;
