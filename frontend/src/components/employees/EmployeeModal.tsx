/**
 * Employee Details Modal Component
 * Shows employee info with edit and delete actions
 */

import React, { useState } from 'react';
import Modal from '@components/common/Modal';
import Button from '@components/common/Button';
import Badge from '@components/common/Badge';
import Card from '@components/common/Card';
import Tabs from '@components/common/Tabs';
import EmployeeTimeline from './EmployeeTimeline';
import { Employee } from '@/types/management';

interface EmployeeModalProps {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
  isLoading?: boolean;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  employee,
  onClose,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!employee) return null;

  const statusColorMap = {
    active: 'green',
    inactive: 'red',
    on_leave: 'yellow',
  } as const;

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'timeline', label: 'Timeline' },
  ];

  const renderDetails = () => (
    <div className="space-y-6">
      {/* Employee Photo and Basic Info */}
      <div className="flex flex-col sm:flex-row gap-6">
        {employee.photo_url && (
          <img
            src={employee.photo_url}
            alt={employee.name}
            className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200 dark:border-slate-300"
          />
        )}

        <div className="flex-1">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-slate-900 mb-2">
            {employee.name}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-slate-500">Status:</span>
              <Badge
                color={statusColorMap[employee.status] || 'gray'}
              >
                {employee.status.replace('_', ' ')}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-slate-500">Employee ID:</span>
              <span className="font-semibold text-gray-900 dark:text-slate-900">
                {employee.id}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-slate-500">Department:</span>
              <span className="font-semibold text-gray-900 dark:text-slate-900">
                {employee.department}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-slate-300">
        <Card className="p-4 bg-gray-50 dark:bg-slate-200/50">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-600 mb-2">
            Email
          </h4>
          <p className="text-gray-900 dark:text-slate-900 break-all">
            {employee.email || '-'}
          </p>
        </Card>

        <Card className="p-4 bg-gray-50 dark:bg-slate-200/50">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-600 mb-2">
            Contact
          </h4>
          <p className="text-gray-900 dark:text-slate-900">
            {employee.contact || '-'}
          </p>
        </Card>

        <Card className="p-4 bg-gray-50 dark:bg-slate-200/50">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-600 mb-2">
            Last Detected
          </h4>
          <p className="text-gray-900 dark:text-slate-900">
            {employee.last_detected
              ? new Date(employee.last_detected).toLocaleString()
              : 'Never'}
          </p>
        </Card>

        <Card className="p-4 bg-gray-50 dark:bg-slate-200/50">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-600 mb-2">
            Current Location
          </h4>
          <p className="text-gray-900 dark:text-slate-900">
            {employee.current_location || 'Unknown'}
          </p>
        </Card>

        <Card className="p-4 bg-gray-50 dark:bg-slate-200/50">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-600 mb-2">
            Created
          </h4>
          <p className="text-gray-900 dark:text-slate-900 text-sm">
            {new Date(employee.created_at).toLocaleString()}
          </p>
        </Card>

        <Card className="p-4 bg-gray-50 dark:bg-slate-200/50">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-600 mb-2">
            Updated
          </h4>
          <p className="text-gray-900 dark:text-slate-900 text-sm">
            {new Date(employee.updated_at).toLocaleString()}
          </p>
        </Card>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title={employee?.name}>
      {showDeleteConfirm ? (
        // Delete Confirmation
        <div className="py-8 space-y-6">
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
            <h4 className="font-semibold text-red-900 dark:text-red-200 mb-2">
              Delete Employee
            </h4>
            <p className="text-sm text-red-800 dark:text-red-300">
              Are you sure you want to delete {employee.name}? This action cannot be undone.
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                onDelete?.(employee);
                setShowDeleteConfirm(false);
              }}
              isLoading={isLoading}
            >
              Delete
            </Button>
          </div>
        </div>
      ) : (
        // Main Content
        <div className="space-y-6">
          {/* Tabs */}
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Tab Content */}
          {activeTab === 'details' && renderDetails()}
          {activeTab === 'timeline' && (
            <EmployeeTimeline
              employeeId={employee.id}
              employeeName={employee.name}
            />
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-slate-300">
            <Button variant="secondary" onClick={onClose} disabled={isLoading}>
              Close
            </Button>
            {onEdit && (
              <Button
                variant="primary"
                onClick={() => onEdit(employee)}
                disabled={isLoading}
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default EmployeeModal;
