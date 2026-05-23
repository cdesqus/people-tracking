/**
 * Visitor List Component
 * Displays active/recent visitors with check-out and extend functionality
 */

import React from 'react';
import Table from '@components/common/Table';
import Button from '@components/common/Button';
import Badge from '@components/common/Badge';
import Card from '@components/common/Card';
import Pagination from '@components/common/Pagination';
import Input from '@components/common/Input';
import { Visitor } from '@types/management';

interface VisitorListProps {
  visitors: Visitor[];
  isLoading?: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  searchTerm: string;
  statusFilter: 'all' | 'checked_in' | 'checked_out' | 'expired';
  onPageChange: (page: number) => void;
  onSearchChange: (term: string) => void;
  onStatusFilterChange: (status: 'all' | 'checked_in' | 'checked_out' | 'expired') => void;
  onRowClick: (visitor: Visitor) => void;
  onCheckOut?: (visitor: Visitor) => void;
  onExtend?: (visitor: Visitor) => void;
}

const VisitorList: React.FC<VisitorListProps> = ({
  visitors,
  isLoading = false,
  currentPage,
  pageSize,
  total,
  searchTerm,
  statusFilter,
  onPageChange,
  onSearchChange,
  onStatusFilterChange,
  onRowClick,
  onCheckOut,
  onExtend,
}) => {
  const totalPages = Math.ceil(total / pageSize);

  const statusColorMap = {
    checked_in: 'success',
    checked_out: 'secondary',
    expired: 'danger',
  } as const;

  const calculateDuration = (checkInTime: string, checkOutTime?: string) => {
    const checkIn = new Date(checkInTime);
    const checkOut = checkOutTime ? new Date(checkOutTime) : new Date();
    const duration = Math.floor((checkOut.getTime() - checkIn.getTime()) / 60000);

    if (duration < 60) return `${duration}m`;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value: string, row: Visitor) => (
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
      key: 'organization',
      label: 'Organization',
      sortable: true,
    },
    {
      key: 'host',
      label: 'Host',
      sortable: true,
    },
    {
      key: 'check_in_time',
      label: 'Check-In',
      render: (value: string) => new Date(value).toLocaleTimeString(),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <Badge variant={statusColorMap[value as keyof typeof statusColorMap] || 'secondary'}>
          {value.replace('_', ' ').toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'check_in_time',
      label: 'Duration',
      render: (_: any, row: Visitor) =>
        calculateDuration(row.check_in_time, row.check_out_time),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Visitor) => (
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
          {row.status === 'checked_in' && onCheckOut && (
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onCheckOut(row);
              }}
            >
              Check Out
            </Button>
          )}
          {row.status === 'checked_in' && onExtend && (
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onExtend(row);
              }}
            >
              Extend
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
            placeholder="Search by name or organization..."
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
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                onStatusFilterChange(
                  e.target.value as 'all' | 'checked_in' | 'checked_out' | 'expired'
                )
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="checked_in">Checked In</option>
              <option value="checked_out">Checked Out</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => {
                onSearchChange('');
                onStatusFilterChange('all');
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
          data={visitors}
          isLoading={isLoading}
          onRowClick={onRowClick}
          emptyMessage="No visitors found"
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

export default VisitorList;
