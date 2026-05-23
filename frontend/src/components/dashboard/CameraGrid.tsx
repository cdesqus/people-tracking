/**
 * Camera Grid Component
 * Displays cameras in responsive grid (1/2/3/4 columns)
 * Each card shows: feed placeholder, status, last detection, click to expand
 */

import React, { useState } from 'react';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';
import { CameraStatus } from '@/types/dashboard';
import { formatRelativeTime } from '@/utils';

interface CameraGridProps {
  cameras: CameraStatus[];
  loading?: boolean;
  onCameraClick?: (camera: CameraStatus) => void;
  maxCameras?: number;
}

const CameraGrid: React.FC<CameraGridProps> = ({
  cameras,
  loading = false,
  onCameraClick,
  maxCameras = 12,
}) => {
  const [expandedCamera, setExpandedCamera] = useState<string | null>(null);

  const displayCameras = cameras.slice(0, maxCameras);

  const handleCameraClick = (camera: CameraStatus) => {
    setExpandedCamera(expandedCamera === camera.id ? null : camera.id);
    onCameraClick?.(camera);
  };

  if (loading) {
    return (
      <Card title="Camera Feed" subtitle="Loading camera status...">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Camera Feed"
      subtitle={`${displayCameras.length} of ${cameras.length} cameras`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayCameras.map((camera) => (
          <div
            key={camera.id}
            className="relative group cursor-pointer"
            onClick={() => handleCameraClick(camera)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleCameraClick(camera);
            }}
          >
            {/* Camera Card */}
            <div className="relative bg-gray-900 dark:bg-gray-950 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:border-blue-400 hover:shadow-lg">
              {/* Video Placeholder */}
              <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="text-center">
                  <div className="text-4xl opacity-50 mb-2">📹</div>
                  <p className="text-xs text-gray-400">Live Feed</p>
                </div>
              </div>

              {/* Status Badge - Top Right */}
              <div className="absolute top-2 right-2">
                <Badge
                  color={camera.isOnline ? 'green' : 'red'}
                  size="sm"
                  className={`text-xs font-semibold ${
                    camera.isOnline ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                  }`}
                >
                  {camera.isOnline ? '● Online' : '● Offline'}
                </Badge>
              </div>

              {/* Camera Info - Bottom */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3">
                <p className="text-sm font-semibold text-white truncate">
                  {camera.name}
                </p>
                <p className="text-xs text-gray-300 truncate mt-1">
                  {camera.location}
                </p>

                {camera.lastDetection && (
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-300">
                    <span>Last detection:</span>
                    <span className="font-medium">
                      {formatRelativeTime(camera.lastDetection)}
                    </span>
                  </div>
                )}

                {/* Detection Count */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-700">
                  <span className="text-xs text-gray-400">Detections</span>
                  <span className="text-sm font-semibold text-blue-400">
                    {camera.detectionCount}
                  </span>
                </div>
              </div>

              {/* Hover Overlay with Action */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="text-center">
                  <div className="text-4xl opacity-80 mb-2">🔍</div>
                  <p className="text-sm font-semibold text-white">
                    Click to expand
                  </p>
                </div>
              </div>
            </div>

            {/* Expanded View Indicator */}
            {expandedCamera === camera.id && (
              <div className="absolute inset-0 ring-2 ring-blue-500 rounded-lg animate-pulse" />
            )}
          </div>
        ))}
      </div>

      {displayCameras.length === 0 && (
        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg">No cameras available</p>
          <p className="text-sm mt-1">Configure cameras in settings</p>
        </div>
      )}
    </Card>
  );
};

export default CameraGrid;
