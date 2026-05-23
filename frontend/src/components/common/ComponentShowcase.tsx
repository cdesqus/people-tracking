/**
 * @file Component Showcase
 * Demo page showing all available components in action
 *
 * Use this during development to see all components and test variations.
 * Not meant for production - remove before shipping.
 *
 * @example
 * // Add to your router for development:
 * import ComponentShowcase from '@/components/common/ComponentShowcase';
 * <Route path="/dev/components" element={<ComponentShowcase />} />
 */

import React, { useState } from 'react';
import {
  Button,
  Input,
  Select,
  Card,
  Alert,
  Modal,
  Loading,
  Toast,
  ToastContainer,
  Table,
  Badge,
  Checkbox,
  RadioGroup,
  DatePicker,
  FileUpload,
  Dropdown,
  Tabs,
  Pagination,
} from './index';
import type { ToastProps } from './types';

/**
 * Showcase Component
 * Demonstrates all available components with various configurations
 */
const ComponentShowcase: React.FC = () => {
  // State management
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('button');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [toggleValue, setToggleValue] = useState(false);
  const [radioValue, setRadioValue] = useState('active');
  const [dateValue, setDateValue] = useState<Date | null>(null);

  // Toast notification handler
  const addToast = (
    type: 'success' | 'error' | 'info' | 'warning',
    message: string
  ) => {
    const id = Date.now().toString();
    setToasts((prev) => [
      ...prev,
      {
        id,
        type,
        message,
        duration: 3000,
        onDismiss: (id) => setToasts((p) => p.filter((t) => t.id !== id)),
      },
    ]);
  };

  // Sample data
  const cameraOptions = [
    { value: 'cam1', label: 'Main Entrance' },
    { value: 'cam2', label: 'Loading Bay' },
    { value: 'cam3', label: 'Server Room' },
  ];

  const tableColumns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Camera Name', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <Badge color={value === 'active' ? 'green' : 'red'}>{value}</Badge>
      ),
    },
  ];

  const tableData = [
    { id: 1, name: 'Main Entrance', status: 'active' },
    { id: 2, name: 'Loading Bay', status: 'active' },
    { id: 3, name: 'Server Room', status: 'offline' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Component Showcase
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Demo page showing all available components. Remove before production.
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs
          tabs={[
            { id: 'button', label: 'Button', content: null },
            { id: 'input', label: 'Input', content: null },
            { id: 'form', label: 'Form Components', content: null },
            { id: 'display', label: 'Display', content: null },
            { id: 'feedback', label: 'Feedback', content: null },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="pill"
        />

        {/* Button Components */}
        {activeTab === 'button' && (
          <div className="space-y-8 mt-8">
            <Card title="Buttons" subtitle="All button variants and sizes">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-3">Variants</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="success">Success</Button>
                    <Button variant="danger">Danger</Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">Sizes</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">States</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button isLoading>Loading</Button>
                    <Button disabled>Disabled</Button>
                    <Button fullWidth>Full Width</Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="primary"
                      onClick={() => addToast('success', 'Success!')}
                    >
                      Show Toast
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setIsModalOpen(true)}
                    >
                      Open Modal
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Input Components */}
        {activeTab === 'input' && (
          <div className="space-y-8 mt-8">
            <Card title="Inputs" subtitle="Text input variations">
              <div className="space-y-4">
                <Input label="Basic Input" placeholder="Enter text" />
                <Input
                  label="Input with Error"
                  error="This field is required"
                  hasError
                />
                <Input
                  label="Disabled Input"
                  disabled
                  placeholder="Disabled"
                />
                <Input
                  label="With Helper Text"
                  helperText="This input has helper text"
                />
              </div>
            </Card>

            <Card title="Select" subtitle="Dropdown selects">
              <Select
                label="Camera Selection"
                options={cameraOptions}
                value={selectedCamera}
                onChange={(val) => setSelectedCamera(val as string)}
                placeholder="Select a camera"
              />
            </Card>
          </div>
        )}

        {/* Form Components */}
        {activeTab === 'form' && (
          <div className="space-y-8 mt-8">
            <Card title="Checkbox" subtitle="Checkbox and toggle variants">
              <div className="space-y-4">
                <Checkbox
                  label="Standard Checkbox"
                  checked={checkboxValue}
                  onChange={setCheckboxValue}
                />
                <Checkbox
                  toggle
                  label="Toggle Switch"
                  checked={toggleValue}
                  onChange={setToggleValue}
                />
              </div>
            </Card>

            <Card title="Radio Group" subtitle="Single selection from options">
              <RadioGroup
                name="camera-status"
                label="Camera Status"
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'error', label: 'Error', description: 'Camera offline' },
                ]}
                value={radioValue}
                onChange={(val) => setRadioValue(val as string)}
              />
            </Card>

            <Card title="Date Picker" subtitle="Date selection">
              <DatePicker
                label="Select Date"
                value={dateValue}
                onChange={setDateValue}
              />
            </Card>

            <Card title="File Upload" subtitle="File picker with preview">
              <FileUpload
                label="Upload File"
                accept="image/*"
                preview
                maxSize={5 * 1024 * 1024}
              />
            </Card>
          </div>
        )}

        {/* Display Components */}
        {activeTab === 'display' && (
          <div className="space-y-8 mt-8">
            <Card title="Badges" subtitle="Status indicators">
              <div className="flex flex-wrap gap-3">
                <Badge color="green">Online</Badge>
                <Badge color="red">Offline</Badge>
                <Badge color="yellow">Warning</Badge>
                <Badge color="blue">Info</Badge>
                <Badge color="gray">Inactive</Badge>
              </div>
            </Card>

            <Card title="Table" subtitle="Data table with sorting">
              <Table
                columns={tableColumns}
                data={tableData}
                striped
                hoverable
              />
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={5}
                  onPageChange={setCurrentPage}
                />
              </div>
            </Card>

            <Card title="Loading" subtitle="Loading states">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-3">Spinner</h3>
                  <Loading text="Loading..." />
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-3">Skeleton</h3>
                  <Loading variant="skeleton" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-3">Progress</h3>
                  <Loading variant="progress" progress={65} />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Feedback Components */}
        {activeTab === 'feedback' && (
          <div className="space-y-8 mt-8">
            <Card title="Alerts" subtitle="Alert types and states">
              <div className="space-y-4">
                <Alert type="success" message="Operation completed successfully!" />
                <Alert
                  type="error"
                  title="Error"
                  message="Something went wrong"
                />
                <Alert
                  type="warning"
                  message="Warning: Camera offline"
                  dismissible
                />
                <Alert type="info" message="New alerts available" />
              </div>
            </Card>

            <Card title="Modals" subtitle="Dialog boxes">
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                Open Modal
              </Button>

              <Modal
                isOpen={isModalOpen}
                title="Example Modal"
                onClose={() => setIsModalOpen(false)}
                footer={
                  <>
                    <Button variant="primary">Save</Button>
                    <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  </>
                }
              >
                <p>This is a modal dialog component.</p>
              </Modal>
            </Card>

            <Card title="Dropdown" subtitle="Context menu">
              <Dropdown
                trigger={<Button>Actions Menu</Button>}
                items={[
                  {
                    id: '1',
                    label: 'View',
                    onClick: () => addToast('info', 'View clicked'),
                  },
                  {
                    id: '2',
                    label: 'Edit',
                    onClick: () => addToast('info', 'Edit clicked'),
                  },
                  { id: '3', divider: true },
                  {
                    id: '4',
                    label: 'Delete',
                    onClick: () => addToast('error', 'Delete clicked'),
                  },
                ]}
              />
            </Card>

            <Card title="Toasts" subtitle="Notifications">
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => addToast('success', 'Success notification!')}
                >
                  Success
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => addToast('error', 'Error notification!')}
                >
                  Error
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => addToast('info', 'Info notification!')}
                >
                  Info
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Toast Container */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
};

export default ComponentShowcase;
