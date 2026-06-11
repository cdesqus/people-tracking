/**
 * User Management Component
 * Manage users, roles, and permissions
 */

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@store/store';
import {
  setSelectedUser,
  setShowUserModal,
  createUserStart,
  createUserSuccess,
  createUserError,
  updateUserStart,
  updateUserSuccess,
  updateUserError,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserError,
} from '@store/slices/settingsSlice';
import { User } from '@store/slices/settingsSlice';
import Card from '@components/common/Card';
import Table from '@components/common/Table';
import Button from '@components/common/Button';
import Modal from '@components/common/Modal';
import Input from '@components/common/Input';
import Select from '@components/common/Select';
import Badge from '@components/common/Badge';

const UserManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    users,
    loading,
    showUserModal,
    selectedUser,
  } = useAppSelector((state) => state.settings);

  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'user',
    status: 'active',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleCreateUser = () => {
    setFormData({
      name: '',
      email: '',
      role: 'user',
      status: 'active',
    });
    dispatch(setSelectedUser(null));
    dispatch(setShowUserModal(true));
  };

  const handleEditUser = (user: User) => {
    setFormData(user);
    dispatch(setSelectedUser(user));
    dispatch(setShowUserModal(true));
  };

  const handleSaveUser = async () => {
    if (!formData.name || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (selectedUser) {
        // Update existing user
        dispatch(updateUserStart());
        const response = await fetch(`/api/users/${selectedUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Failed to update user');
        const data = await response.json();
        dispatch(updateUserSuccess(data));
      } else {
        // Create new user
        dispatch(createUserStart());
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Failed to create user');
        const data = await response.json();
        dispatch(createUserSuccess(data));
      }

      dispatch(setShowUserModal(false));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error saving user';
      selectedUser
        ? dispatch(updateUserError(message))
        : dispatch(createUserError(message));
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      dispatch(deleteUserStart());
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete user');

      dispatch(deleteUserSuccess(selectedUser.id));
      setShowDeleteConfirm(false);
      dispatch(setShowUserModal(false));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error deleting user';
      dispatch(deleteUserError(message));
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (value: string) => (
        <Badge className={`${
          value === 'admin'
            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        }`}>
          {value.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <Badge className={`${
          value === 'active'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-slate-700'
        }`}>
          {value.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: User) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEditUser(row)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              dispatch(setSelectedUser(row));
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
      <Card title="User Management" subtitle="Manage system users and roles">
        <div className="mb-6">
          <Button onClick={handleCreateUser}>
            Create New User
          </Button>
        </div>

        <Table
          columns={columns}
          data={users}
          isLoading={loading}
          emptyMessage="No users found"
          striped
          hoverable
        />
      </Card>

      {/* User Modal */}
      <Modal
        isOpen={showUserModal && !showDeleteConfirm}
        title={selectedUser ? 'Edit User' : 'Create New User'}
        size="md"
        onClose={() => dispatch(setShowUserModal(false))}
      >
        <div className="p-6 space-y-4">
          <Input
            label="Name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter user name"
            required
          />

          <Input
            label="Email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter email address"
            required
          />

          <Select
            label="Role"
            value={formData.role || 'user'}
            onChange={(value) =>
              setFormData({ ...formData, role: value as 'admin' | 'user' | 'viewer' })
            }
            options={[
              { value: 'admin', label: 'Administrator' },
              { value: 'user', label: 'User' },
              { value: 'viewer', label: 'Viewer' },
            ]}
          />

          <Select
            label="Status"
            value={formData.status || 'active'}
            onChange={(value) =>
              setFormData({ ...formData, status: value as 'active' | 'inactive' })
            }
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="secondary"
              onClick={() => dispatch(setShowUserModal(false))}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveUser}
              isLoading={loading}
            >
              {selectedUser ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      {showDeleteConfirm && selectedUser && (
        <Modal
          isOpen={showDeleteConfirm}
          title="Confirm Delete"
          size="sm"
          onClose={() => setShowDeleteConfirm(false)}
        >
          <div className="p-6 space-y-4">
            <p className="text-gray-600 dark:text-slate-500">
              Are you sure you want to delete user <strong>{selectedUser.name}</strong>?
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
                onClick={handleDeleteUser}
                isLoading={loading}
              >
                Delete User
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserManagement;
