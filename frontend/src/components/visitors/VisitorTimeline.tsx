/**
 * Visitor Timeline Component
 * Shows visitor movement history and locations
 */

import React, { useState, useEffect } from 'react';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';
import { VisitorTimeline as TimelineData } from '@/types/management';

interface VisitorTimelineProps {
  visitorId: string;
  visitorName: string;
}

const VisitorTimeline: React.FC<VisitorTimelineProps> = ({
  visitorId,
  visitorName,
}) => {
  const [timeline, setTimeline] = useState<TimelineData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimeline = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/visitors/${visitorId}/timeline`);
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
  }, [visitorId]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getEventColor = (event: string) => {
    switch (event) {
      case 'check_in':
        return 'success';
      case 'check_out':
        return 'danger';
      case 'movement':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getEventLabel = (event: string) => {
    return event.replace('_', ' ').toUpperCase();
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Movement Timeline - {visitorName}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          All recorded locations and movements during visit
        </p>
      </div>

      {/* Timeline */}
      <Card>
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Loading timeline...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            {error}
          </div>
        ) : timeline.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No movement records found
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-sky-400 to-sky-600" />

            {/* Timeline items */}
            <div className="space-y-4 p-6">
              {timeline.map((item, index) => (
                <div key={item.id || index} className="flex gap-6 relative">
                  {/* Timeline dot with event color */}
                  <div className="absolute left-2 top-2 w-4 h-4 rounded-full bg-sky-500 border-4 border-white dark:border-slate-800" />

                  {/* Content */}
                  <div className="flex-1 ml-8 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {item.location}
                          </h4>
                          <Badge variant={getEventColor(item.event)}>
                            {getEventLabel(item.event)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Camera: {item.camera}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatTime(item.timestamp)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(item.timestamp)}
                        </p>
                      </div>
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
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Events</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {timeline.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Check-In</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                {timeline.filter((t) => t.event === 'check_in').length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Movements</p>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {timeline.filter((t) => t.event === 'movement').length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Unique Locations</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {new Set(timeline.map((t) => t.location)).size}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default VisitorTimeline;
