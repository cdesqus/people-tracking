/**
 * Visitor Check-In Form Component
 * Handles visitor registration and check-in with badge generation
 */

import React, { useState, useEffect } from 'react';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import FileUpload from '@components/common/FileUpload';
import Card from '@components/common/Card';
import Alert from '@components/common/Alert';
import { Visitor } from '@types/management';

interface VisitorCheckInFormProps {
  onSubmit: (visitor: Omit<Visitor, 'id' | 'created_at' | 'updated_at' | 'check_in_time' | 'status'> & { photo?: File }) => Promise<Visitor>;
  isLoading?: boolean;
  onCancel?: () => void;
  onSuccess?: (visitor: Visitor) => void;
}

interface FormData {
  name: string;
  organization: string;
  purpose: string;
  host: string;
  phone: string;
  email: string;
  expected_checkout?: string;
}

const VisitorCheckInForm: React.FC<VisitorCheckInFormProps> = ({
  onSubmit,
  isLoading = false,
  onCancel,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    organization: '',
    purpose: '',
    host: '',
    phone: '',
    email: '',
    expected_checkout: '',
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [checkedInVisitor, setCheckedInVisitor] = useState<Visitor | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.organization.trim()) {
      newErrors.organization = 'Organization is required';
    }
    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Purpose is required';
    }
    if (!formData.host.trim()) {
      newErrors.host = 'Host is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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
    setSuccessMessage('');
    try {
      const photoFile = photo || undefined;
      const visitor = await onSubmit({
        name: formData.name,
        organization: formData.organization,
        purpose: formData.purpose,
        host: formData.host,
        phone: formData.phone,
        email: formData.email,
        expected_checkout: formData.expected_checkout,
        photo: photoFile,
      } as any);

      setCheckedInVisitor(visitor);
      setSuccessMessage(`${formData.name} checked in successfully!`);

      // Reset form
      setFormData({
        name: '',
        organization: '',
        purpose: '',
        host: '',
        phone: '',
        email: '',
        expected_checkout: '',
      });
      setPhoto(null);
      setPhotoPreview(null);

      onSuccess?.(visitor);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    if (checkedInVisitor) {
      const printWindow = window.open('', '', 'height=500,width=800');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Visitor Badge - ${checkedInVisitor.name}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .badge { border: 2px solid #000; padding: 20px; text-align: center; }
                .name { font-size: 24px; font-weight: bold; margin: 10px 0; }
                .org { font-size: 14px; margin: 5px 0; }
                .qr { margin: 20px 0; }
                .qr img { max-width: 200px; }
              </style>
            </head>
            <body>
              <div class="badge">
                <div class="name">${checkedInVisitor.name}</div>
                <div class="org">${checkedInVisitor.organization}</div>
                <div>Badge #${checkedInVisitor.badge_number || 'N/A'}</div>
                <div class="qr">
                  ${checkedInVisitor.qr_code ? `<img src="${checkedInVisitor.qr_code}" alt="QR Code" />` : 'QR Code will be generated'}
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (checkedInVisitor) {
    return (
      <Card className="w-full">
        <div className="space-y-6">
          <div className="text-center">
            <svg
              className="w-16 h-16 text-green-500 mx-auto mb-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Check-In Successful
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {checkedInVisitor.name} has been checked in
            </p>
          </div>

          {/* Badge Information */}
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
                Badge Information
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-blue-800 dark:text-blue-300">Name</p>
                  <p className="font-semibold text-blue-900 dark:text-blue-200">
                    {checkedInVisitor.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-800 dark:text-blue-300">Badge #</p>
                  <p className="font-semibold text-blue-900 dark:text-blue-200">
                    {checkedInVisitor.badge_number || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-800 dark:text-blue-300">Organization</p>
                  <p className="font-semibold text-blue-900 dark:text-blue-200">
                    {checkedInVisitor.organization}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-800 dark:text-blue-300">Host</p>
                  <p className="font-semibold text-blue-900 dark:text-blue-200">
                    {checkedInVisitor.host}
                  </p>
                </div>
              </div>
            </div>

            {checkedInVisitor.qr_code && (
              <div className="flex justify-center">
                <div className="border-2 border-gray-300 dark:border-slate-600 rounded-lg p-4">
                  <img
                    src={checkedInVisitor.qr_code}
                    alt="QR Code"
                    className="w-32 h-32"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-slate-700">
            <Button variant="secondary" onClick={() => setCheckedInVisitor(null)}>
              Check In Another Visitor
            </Button>
            <Button variant="primary" onClick={handlePrint}>
              Print Badge
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Visitor Check-In
        </h3>

        {successMessage && (
          <Alert
            type="success"
            message={successMessage}
            onDismiss={() => setSuccessMessage('')}
          />
        )}

        {/* Photo Upload Section */}
        <div className="space-y-4">
          <FileUpload
            label="Visitor Photo"
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
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+1 (555) 123-4567"
            hasError={!!errors.phone}
            error={errors.phone}
            required
          />

          <Input
            label="Organization"
            name="organization"
            value={formData.organization}
            onChange={handleInputChange}
            placeholder="ABC Corporation"
            hasError={!!errors.organization}
            error={errors.organization}
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

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Purpose of Visit
            </label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              placeholder="Meeting, Presentation, etc."
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              rows={3}
            />
            {errors.purpose && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.purpose}
              </p>
            )}
          </div>

          <Input
            label="Host Name"
            name="host"
            value={formData.host}
            onChange={handleInputChange}
            placeholder="Meeting organizer name"
            hasError={!!errors.host}
            error={errors.host}
            required
          />

          <Input
            label="Expected Checkout"
            name="expected_checkout"
            type="datetime-local"
            value={formData.expected_checkout}
            onChange={handleInputChange}
          />
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
            Check In Visitor
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default VisitorCheckInForm;
