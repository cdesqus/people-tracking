/**
 * Recent Detections Table Component
 * Shows last 20 detections with sorting and pagination
 */

import React, { useState } from 'react';
import Card from '@components/common/Card';
import Table from '@components/common/Table';
import Pagination from '@components/common/Pagination';
import { DetectionRecord } from '@/types/dashboard';
import { formatRelativeTime, formatDateTime } from '@/utils';

interface RecentDetectionsProps {
  detections: any[];
  loading?: boolean;
  onDetectionClick?: (detection: DetectionRecord) => void;
}

const RecentDetections: React.FC<RecentDetectionsProps> = ({
  detections,
  loading = false,
  onDetectionClick,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>({ key: 'timestamp', direction: 'desc' });

  const itemsPerPage = 10;

  // Convert Face records to DetectionRecords
  const detectionRecords: DetectionRecord[] = detections.map((face: any) => ({
    id: face.id,
    personId: face.person_id,
    personName: face.face_match || 'Unknown',
    cameraId: face.camera_id,
    cameraName: `Camera ${face.camera_id}`,
    confidence: Math.round(face.confidence * 100),
    timestamp: face.timestamp,
  }));

  // Sort detections
  let sortedDetections = [...detectionRecords];
  if (sortConfig) {
    sortedDetections.sort((a, b) => {
      let aValue: any = a[sortConfig.key as keyof DetectionRecord];
      let bValue: any = b[sortConfig.key as keyof DetectionRecord];

      if (typeof aValue === 'string') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // Paginate
  const totalPages = Math.ceil(sortedDetections.length / itemsPerPage);
  const paginatedDetections = sortedDetections.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = [
    {
      key: 'timestamp',
      label: 'Time',
      sortable: true,
      render: (value: string) => (
        <div className="flex flex-col">
          <span className="font-medium">{formatRelativeTime(value)}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDateTime(value)}
          </span>
        </div>
      ),
    },
    {
      key: 'personName',
      label: 'Person',
      sortable: true,
      render: (value: string, row: DetectionRecord) => (
        <div className="flex flex-col">
          <span className="font-medium">{value}</span>
          {row.personId && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ID: {row.personId}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'cameraName',
      label: 'Camera',
      sortable: true,
      render: (value: string) => <span>{value}</span>,
    },
    {
      key: 'confidence',
      label: 'Confidence',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                value >= 90
                  ? 'bg-green-500'
                  : value >= 70
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-sm font-semibold min-w-12">{value}%</span>
        </div>
      ),
    },
  ];

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  return (
    <Card
      title="Recent Detections"
      subtitle={`Last ${sortedDetections.length} detections`}
    >
      <div className="flex flex-col">
        <Table
          columns={columns}
          data={paginatedDetections}
          isLoading={loading}
          hoverable
          striped
          onSort={handleSort}
          onRowClick={onDetectionClick}
          emptyMessage="No detections yet"
          className="cursor-pointer"
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default RecentDetections;
