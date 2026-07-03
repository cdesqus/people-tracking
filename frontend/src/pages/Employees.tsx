/**
 * Employee Management Page
 * Main page for managing employees with registration, list, and details
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@store/store';
import {
  fetchEmployeesStart,
  fetchEmployeesSuccess,
  fetchEmployeesError,
  createEmployeeStart,
  createEmployeeSuccess,
  createEmployeeError,
  deleteEmployeeStart,
  deleteEmployeeSuccess,
  deleteEmployeeError,
  selectEmployee,
  setCurrentPage,
  setSearchTerm,
  setDepartmentFilter,
  clearSuccess,
  clearError,
} from '@store/slices/employeeSlice';
import EmployeeForm from '@components/employees/EmployeeForm';
import EmployeeList from '@components/employees/EmployeeList';
import EmployeeModal from '@components/employees/EmployeeModal';
import Alert from '@components/common/Alert';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import Modal from '@components/common/Modal';
import { Employee } from '@/types/management';

const EmployeesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    employees,
    selectedEmployee,
    loading,
    error,
    success,
    total,
    currentPage,
    pageSize,
    searchTerm,
    departmentFilter,
  } = useAppSelector((state) => state.employees);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);

  // Fetch employees on mount and when filters change
  const fetchEmployees = useCallback(async () => {
    dispatch(fetchEmployeesStart());
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('page_size', pageSize.toString());
      if (searchTerm) params.append('search', searchTerm);
      if (departmentFilter) params.append('department', departmentFilter);

      const response = await fetch(`/api/employees?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch employees');

      const data = await response.json();
      dispatch(
        fetchEmployeesSuccess({
          employees: data.items || [],
          total: data.total || 0,
        })
      );
    } catch (err) {
      dispatch(
        fetchEmployeesError(
          err instanceof Error ? err.message : 'Error fetching employees'
        )
      );
    }
  }, [dispatch, currentPage, pageSize, searchTerm, departmentFilter]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/employees/departments');
        if (response.ok) {
          const data = await response.json();
          setDepartments(data.departments || []);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    fetchDepartments();
  }, []);

  // Auto-dismiss messages
  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => dispatch(clearSuccess()), 3000);
    return () => clearTimeout(timer);
  }, [success, dispatch]);

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => dispatch(clearError()), 3000);
    return () => clearTimeout(timer);
  }, [error, dispatch]);

  // Handle form submission
  const handleRegisterEmployee = async (
    formData: Omit<Employee, 'created_at' | 'updated_at'> & { photos?: File[] }
  ) => {
    dispatch(createEmployeeStart());
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('id', formData.id);
      data.append('department', formData.department);
      if (formData.email) data.append('email', formData.email);
      if (formData.contact) data.append('contact', formData.contact);
      data.append('status', formData.status);
      formData.photos?.forEach((photo) => data.append('photos', photo));

      const response = await fetch('/api/employees', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.detail || 'Failed to register employee');
      }

      const employee = await response.json();
      dispatch(createEmployeeSuccess(employee));
      setShowRegisterModal(false);
      fetchEmployees();
    } catch (err) {
      dispatch(
        createEmployeeError(
          err instanceof Error ? err.message : 'Error registering employee'
        )
      );
      throw err;
    }
  };

  // Handle delete
  const handleDelete = async (employee: Employee) => {
    dispatch(deleteEmployeeStart());
    try {
      const response = await fetch(`/api/employees/${employee.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete employee');

      dispatch(deleteEmployeeSuccess(employee.id));
      setShowModal(false);
    } catch (err) {
      dispatch(
        deleteEmployeeError(
          err instanceof Error ? err.message : 'Error deleting employee'
        )
      );
    }
  };

  const handleAddFacePhotos = async (employee: Employee, photos: File[]) => {
    const data = new FormData();
    photos.forEach((photo) => data.append('photos', photo));

    const response = await fetch(`/api/employees/${employee.id}/face-photos`, {
      method: 'POST',
      body: data,
    });
    const responseBody = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(responseBody?.detail || 'Failed to add face photos');
    }

    const facePhotoCount = responseBody.face_photo_count || employee.face_photo_count || 0;
    dispatch(selectEmployee({ ...employee, face_photo_count: facePhotoCount }));
    fetchEmployees();
    return facePhotoCount;
  };



  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-900">
            Employee Management
          </h1>
          <p className="text-gray-600 dark:text-slate-500 mt-1">
            Manage employees, track locations, and view detection history
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowRegisterModal(true)}>
          + Tambah Karyawan
        </Button>
      </div>

      {/* Alerts */}
      {success && (
        <Alert
          type="success"
          title="Success"
          message={success}
          onDismiss={() => dispatch(clearSuccess())}
        />
      )}
      {error && (
        <Alert
          type="error"
          title="Error"
          message={error}
          onDismiss={() => dispatch(clearError())}
        />
      )}

      {/* Employee List */}
      <EmployeeList
        employees={employees}
        isLoading={loading}
        currentPage={currentPage}
        pageSize={pageSize}
        total={total}
        searchTerm={searchTerm}
        departmentFilter={departmentFilter}
        onPageChange={(page) => dispatch(setCurrentPage(page))}
        onSearchChange={(term) => dispatch(setSearchTerm(term))}
        onDepartmentFilterChange={(dept) =>
          dispatch(setDepartmentFilter(dept))
        }
        onRowClick={(employee) => {
          dispatch(selectEmployee(employee));
          setShowModal(true);
        }}
        onDeleteClick={(employee) => {
          dispatch(selectEmployee(employee));
          setShowDeleteConfirm(true);
        }}
        departments={departments}
      />

      {/* Employee Details Modal */}
      <EmployeeModal
        isOpen={showModal && !showDeleteConfirm}
        employee={selectedEmployee}
        onClose={() => setShowModal(false)}
        onDelete={(employee) => {
          setShowDeleteConfirm(true);
        }}
        onAddFacePhotos={handleAddFacePhotos}
        isLoading={loading}
      />

      {/* Employee Registration Modal */}
      <Modal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        size="lg"
        title="Daftar Karyawan Baru"
      >
        <EmployeeForm
          onSubmit={handleRegisterEmployee}
          isLoading={loading}
          onCancel={() => setShowRegisterModal(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-900">
                  Delete Employee
                </h3>
                <p className="text-gray-600 dark:text-slate-500 mt-2">
                  Are you sure you want to delete {selectedEmployee.name}? This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(selectedEmployee)}
                  isLoading={loading}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;
