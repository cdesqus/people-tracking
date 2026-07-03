/**
 * Employee Registration Form Component
 * Handles new employee registration with photo upload
 */

import React, { useState } from 'react';
import { Upload, Camera, X } from 'lucide-react';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import CameraCapture from '../common/CameraCapture';
import { Employee } from '@/types/management';

interface EmployeeFormProps {
  onSubmit: (
    employee: Omit<Employee, 'created_at' | 'updated_at'> & { photos?: File[] }
  ) => Promise<void>;
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

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [photoSource, setPhotoSource] = useState<'upload' | 'camera'>('upload');
  const [cameraKey, setCameraKey] = useState(0);
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
    if (photos.length < 3 || photos.length > 5) {
      newErrors.photo = 'Upload 3–5 face photos from different angles';
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

  const setEnrollmentPhotos = (files: File[]) => {
    const validFiles = files
      .filter((file) => file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024)
      .slice(0, 5);

    photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    setPhotos(validFiles);
    setPhotoPreviews(validFiles.map((file) => URL.createObjectURL(file)));
    setErrors((prev) => ({ ...prev, photo: '' }));
  };

  const addCameraPhoto = (file: File | null) => {
    if (!file || photos.length >= 5) return;
    const nextPhotos = [...photos, file];
    setPhotos(nextPhotos);
    setPhotoPreviews((prev) => [...prev, URL.createObjectURL(file)]);
    setErrors((prev) => ({ ...prev, photo: '' }));
    // Remount the capture component so the operator can immediately take
    // another angle without replacing the previous photo.
    if (nextPhotos.length < 5) {
      setCameraKey((key) => key + 1);
    }
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotos((prev) => prev.filter((_, photoIndex) => photoIndex !== index));
    setPhotoPreviews((prev) => prev.filter((_, photoIndex) => photoIndex !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        name: formData.name,
        id: formData.id,
        department: formData.department,
        email: formData.email || undefined,
        contact: formData.contact || undefined,
        status: formData.status,
        photos,
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
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
      setPhotos([]);
      setPhotoPreviews([]);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-900">
          Register New Employee
        </h3>

        {/* Photo Selection Tabs */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-600">
            Employee Photo Source
          </label>
          <div className="flex gap-2 max-w-sm">
            <button
              type="button"
              onClick={() => setPhotoSource('upload')}
              className={`flex-1 py-2 px-4 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                photoSource === 'upload'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-100 border-gray-300 dark:border-slate-300 text-gray-700 dark:text-slate-600'
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setPhotoSource('camera')}
              className={`flex-1 py-2 px-4 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                photoSource === 'camera'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-100 border-gray-300 dark:border-slate-300 text-gray-700 dark:text-slate-600'
              }`}
            >
              <Camera className="w-4 h-4" />
              Use Camera
            </button>
          </div>

          {photoSource === 'upload' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-600 mb-1.5">
                Face Photos (3–5) <span className="text-red-500">*</span>
              </label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center hover:border-blue-400">
                <Upload className="w-10 h-10 text-slate-400 mb-2" />
                <span className="text-sm font-medium text-gray-800">
                  Choose 3–5 photos
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  Front, slight left, slight right — maximum 5MB each
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(event) =>
                    setEnrollmentPhotos(Array.from(event.target.files || []))
                  }
                />
              </label>
            </div>
          ) : (
            photos.length < 5 ? (
              <div>
                <p className="text-xs text-gray-500 mb-2">
                  Capture angle {photos.length + 1} of at least 3
                </p>
                <CameraCapture key={cameraKey} onCapture={addCameraPhoto} />
              </div>
            ) : (
              <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700">
                Five enrollment photos captured.
              </div>
            )
          )}

          {photoPreviews.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-600">
                  Enrollment photos
                </span>
                <span className={`text-xs font-semibold ${photos.length >= 3 ? 'text-green-600' : 'text-amber-600'}`}>
                  {photos.length}/5 {photos.length < 3 ? `(need ${3 - photos.length} more)` : 'ready'}
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {photoPreviews.map((preview, index) => (
                  <div key={preview} className="relative aspect-square">
                    <img
                      src={preview}
                      alt={`Face angle ${index + 1}`}
                      className="w-full h-full rounded-lg object-cover border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white shadow"
                      aria-label={`Remove face photo ${index + 1}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {errors.photo && <p className="text-sm text-red-600">{errors.photo}</p>}
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
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-600 mb-1.5">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-300 rounded-lg bg-white dark:bg-slate-100 text-gray-900 dark:text-slate-900"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-slate-300">
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
    </div>
  );
};

export default EmployeeForm;
