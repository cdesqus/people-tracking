/**
 * Employee Timeline Component
 * Shows detection history for an employee
 */

import React, { useState, useEffect } from 'react';
import Card from '@components/common/Card';
import Input from '@components/common/Input';
import { EmployeeTimeline as TimelineData } from '@/types/management';

interface EmployeeTimelineProps {
  employeeId: string;
  employeeName: string;
  onClose?: () => void;
}

const EmployeeTimeline: React.FC<EmployeeTimelineProps> = ({
  employeeId,
  employeeName,
  onClose,
}) => {
  const [timeline, setTimeline] = useState<TimelineData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const fetchTimeline = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.append('person_id', employeeId);
        if (dateFilter) {
          params.append('date', dateFilter);
        }

        const response = await fetch(`/api/detections?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch timeline');
        }

        const data = await response.json();
        setTimeline(data.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching timeline');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeline();
  }, [employeeId, dateFilter]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-900">
            Detection Timeline - {employeeName}
          </h3>
          <p className="text-sm text-gray-600 dark:text-slate-500 mt-1">
            All locations and timestamps where {employeeName} was detected
          </p>
        </div>
      </div>

      {/* Date Filter */}
      <Card className="p-4">
        <Input
          type="date"
          label="Filter by Date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </Card>

      {/* Timeline */}
      <Card>
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-500">
            Loading timeline...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            {error}
          </div>
        ) : timeline.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-500">
            No detections found
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-sky-400 to-sky-600" />

            {/* Timeline items */}
            <div className="space-y-4 p-6">
              {timeline.map((item, index) => (
                <div key={item.id || index} className="flex gap-6 relative">
                  {/* Timeline dot */}
                  <div className="absolute left-2 top-2 w-4 h-4 rounded-full bg-sky-500 border-4 border-white dark:border-slate-200" />

                  {/* Content */}
                  <div className="flex-1 ml-8 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-slate-900">
                          {item.location}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-slate-500">
                          Camera: {item.camera}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-slate-900">
                          {formatTime(item.timestamp)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-slate-500">
                          {formatDate(item.timestamp)}
                        </p>
                      </div>
                    </div>

                    {/* Confidence */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-slate-200 rounded-full h-2 max-w-xs">
                        <div
                          className="bg-sky-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min(100, (item.confidence || 0) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-slate-500 font-semibold min-w-12">
                        {((item.confidence || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Summary */}
      {!isLoading && timeline.length > 0 && (
        <Card className="p-4 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600 dark:text-slate-500">Total Detections</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-slate-900">
                {timeline.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-slate-500">Date Range</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-900">
                {timeline.length > 0
                  ? `${formatDate(timeline[timeline.length - 1].timestamp)} - ${formatDate(
                      timeline[0].timestamp
                    )}`
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-slate-500">Avg Confidence</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-slate-900">
                {(
                  (timeline.reduce((sum, t) => sum + (t.confidence || 0), 0) /
                    timeline.length) *
                  100
                ).toFixed(0)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-slate-500">Unique Locations</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-slate-900">
                {new Set(timeline.map((t) => t.location)).size}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default EmployeeTimeline;
