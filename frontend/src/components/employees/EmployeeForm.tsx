/**
 * Employee Registration Form Component
 * Handles new employee registration with photo upload
 */

import React, { useState } from 'react';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import FileUpload from '@components/common/FileUpload';
import Card from '@components/common/Card';
import { Employee } from '@/types/management';

interface EmployeeFormProps {
  onSubmit: (employee: Omit<Employee, 'created_at' | 'updated_at'> & { photo?: File }) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

interface FormData {
  name: string;
  id: string;
  department: string;
  email: string;
  contact: string;
  status: 'active' | 'inactive' | 'on_leave';
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  onSubmit,
  isLoading = false,
  onCancel,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    id: '',
    department: '',
    email: '',
    contact: '',
    status: 'active',
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.id.trim()) {
      newErrors.id = 'Employee ID is required';
    }
    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handlePhotoChange = (file: File | null) => {
    setPhoto(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const photoFile = photo || undefined;
      await onSubmit({
        name: formData.name,
        id: formData.id,
        department: formData.department,
        email: formData.email || undefined,
        contact: formData.contact || undefined,
        status: formData.status,
        photo: photoFile,
      } as any);

      // Reset form on success
      setFormData({
        name: '',
        id: '',
        department: '',
        email: '',
        contact: '',
        status: 'active',
      });
      setPhoto(null);
      setPhotoPreview(null);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Register New Employee
        </h3>

        {/* Photo Upload Section */}
        <div className="space-y-4">
          <FileUpload
            label="Employee Photo"
            accept="image/*"
            maxSize={5 * 1024 * 1024}
            onFileChange={handlePhotoChange}
            error={errors.photo}
          />
          {photoPreview && (
            <div className="flex justify-center">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-32 h-32 rounded-lg object-cover border border-gray-200 dark:border-slate-600"
              />
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="John Doe"
            hasError={!!errors.name}
            error={errors.name}
            required
          />

          <Input
            label="Employee ID"
            name="id"
            value={formData.id}
            onChange={handleInputChange}
            placeholder="EMP-001"
            hasError={!!errors.id}
            error={errors.id}
            required
          />

          <Input
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            placeholder="Engineering"
            hasError={!!errors.department}
            error={errors.department}
            required
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="john@example.com"
            hasError={!!errors.email}
            error={errors.email}
          />

          <Input
            label="Contact Number"
            name="contact"
            value={formData.contact}
            onChange={handleInputChange}
            placeholder="+1 (555) 123-4567"
          />

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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-slate-700">
          {onCancel && (
            <Button variant="secondary" onClick={onCancel} disabled={isLoading || submitting}>
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || submitting}
            isLoading={submitting}
          >
            Register Employee
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default EmployeeForm;
