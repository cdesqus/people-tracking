/**
 * Employee List Component
 * Displays employees in a searchable, filterable, paginated table
 */

import React from 'react';
import Table from '@components/common/Table';
import Button from '@components/common/Button';
import Badge from '@components/common/Badge';
import Card from '@components/common/Card';
import Pagination from '@components/common/Pagination';
import Input from '@components/common/Input';
import { Employee } from '@/types/management';

interface EmployeeListProps {
  employees: Employee[];
  isLoading?: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  searchTerm: string;
  departmentFilter: string;
  onPageChange: (page: number) => void;
  onSearchChange: (term: string) => void;
  onDepartmentFilterChange: (dept: string) => void;
  onRowClick: (employee: Employee) => void;
  onDeleteClick?: (employee: Employee) => void;
  departments?: string[];
}

const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  isLoading = false,
  currentPage,
  pageSize,
  total,
  searchTerm,
  departmentFilter,
  onPageChange,
  onSearchChange,
  onDepartmentFilterChange,
  onRowClick,
  onDeleteClick,
  departments = [],
}) => {
  const totalPages = Math.ceil(total / pageSize);

  const statusColorMap = {
    active: 'success',
    inactive: 'danger',
    on_leave: 'warning',
  } as const;

  const columns = [
    {
      key: 'id',
      label: 'Employee ID',
      sortable: true,
      width: '120px',
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value: string, row: Employee) => (
        <div className="flex items-center gap-3">
          {row.photo_url && (
            <img
              src={row.photo_url}
              alt={row.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <Badge variant={statusColorMap[value as keyof typeof statusColorMap] || 'secondary'}>
          {value.replace('_', ' ').charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'last_detected',
      label: 'Last Detected',
      render: (value?: string) => {
        if (!value) return '-';
        const date = new Date(value);
        return date.toLocaleString();
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Employee) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRowClick(row);
            }}
          >
            View
          </Button>
          {onDeleteClick && (
            <Button
              variant="danger"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick(row);
              }}
            >
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Search"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Department
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => onDepartmentFilterChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => {
                onSearchChange('');
                onDepartmentFilterChange('');
              }}
              className="w-full"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          data={employees}
          isLoading={isLoading}
          onRowClick={onRowClick}
          emptyMessage="No employees found"
          striped
          hoverable
        />
      </Card>

      {/* Pagination */}
      <Card className="p-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={total}
          pageSize={pageSize}
          onPageChange={onPageChange}
          showQuickJumper
          showPageSizeSelector
        />
      </Card>
    </div>
  );
};

export default EmployeeList;
