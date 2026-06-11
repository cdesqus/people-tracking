/**
 * Visitor Details Modal Component
 * Shows visitor info with check-out and extend options
 */

import React, { useState } from 'react';
import Modal from '@components/common/Modal';
import Button from '@components/common/Button';
import Badge from '@components/common/Badge';
import Card from '@components/common/Card';
import Input from '@components/common/Input';
import Tabs from '@components/common/Tabs';
import VisitorTimeline from './VisitorTimeline';
import { Visitor } from '@/types/management';

interface VisitorModalProps {
  isOpen: boolean;
  visitor: Visitor | null;
  onClose: () => void;
  onCheckOut?: (visitor: Visitor) => void;
  onExtend?: (visitor: Visitor, hours: number) => void;
  onDelete?: (visitor: Visitor) => void;
  isLoading?: boolean;
}

const VisitorModal: React.FC<VisitorModalProps> = ({
  isOpen,
  visitor,
  onClose,
  onCheckOut,
  onExtend,
  onDelete,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [showExtendForm, setShowExtendForm] = useState(false);
  const [extendHours, setExtendHours] = useState('1');

  if (!visitor) return null;

  const statusColorMap = {
    checked_in: 'green',
    checked_out: 'gray',
    expired: 'red',
  } as const;

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'timeline', label: 'Movement' },
  ];

  const calculateDuration = (checkInTime: string, checkOutTime?: string) => {
    const checkIn = new Date(checkInTime);
    const checkOut = checkOutTime ? new Date(checkOutTime) : new Date();
    const duration = Math.floor((checkOut.getTime() - checkIn.getTime()) / 60000);

    if (duration < 60) return `${duration}m`;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  };

  const renderDetails = () => (
    <div className="space-y-6">
      {/* Visitor Photo and Basic Info */}
      <div className="flex flex-col sm:flex-row gap-6">
        {visitor.photo_url && (
          <img
            src={visitor.photo_url}
            alt={visitor.name}
            className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200 dark:border-slate-300"
          />
        )}

        <div className="flex-1">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-slate-900 mb-2">
            {visitor.name}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-slate-500">Status:</span>
              <Badge color={statusColorMap[visitor.status] || 'gray'}>
                {visitor.status.replace('_', ' ')}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-slate-500">Duration:</span>
              <span className="font-semibold text-gray-900 dark:text-slate-900">
                {calculateDuration(visitor.check_in_time, visitor.check_out_time)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-slate-500">Badge #:</span>
              <span className="font-semibold text-gray-900 dark:text-slate-900">
                {visitor.badge_number || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code */}
      {visitor.qr_code && (
        <div className="flex justify-center">
          <div className="border-2 border-gray-300 dark:border-slate-300 rounded-lg p-4">
            <img
              src={visitor.qr_code}
              alt="QR Code"
              className="w-40 h-40"
            />
          </div>
        </div>
      )}

      {/* Detailed Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-slate-300">
        <Card className="p-4 bg-gray-50 dark:bg-slate-200/50">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-600 mb-2">
            Organization
          </h4>
          <p className="text-gray-900 dark:text-slate-900">{visitor.organization}</p>
        </Card>

        <Card className="p-4 bg-gray-50 dark:bg-slate-200/50">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-600 mb-2">
            Host
          </h4>
          <p className="text-gray-900 dark:text-slate-900">{visitor.host}</p>
        </Card>

        <Card className="p-4 bg-gray-50 dark:bg-slate-200/50">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-600 mb-2">
            Email
          </h4>
          <p className="text-gray-900 dark:text-slate-900 break-all">
            {visitor.email || '-'}
          </p>
        </Card>

        <Card className="p-4 bg-gray-50 dark:bg-slate-200/50">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-600 mb-2">
            Phone
          </h4>
          <p className="text-gray-900 dark:text-slate-900">{visitor.phone}</p>
        </Card>

        <Card className="p-4 bg-gray-50 dark:bg-slate-200/50">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-600 mb-2">
            Check-In Time
          </h4>
          <p className="text-gray-900 dark:text-slate-900 text-sm">
            {new Date(visitor.check_in_time).toLocaleString()}
          </p>
        </Card>

        <Card className="p-4 bg-gray-50 dark:bg-slate-200/50">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-600 mb-2">
            Expected Checkout
          </h4>
          <p className="text-gray-900 dark:text-slate-900 text-sm">
            {visitor.expected_checkout
              ? new Date(visitor.expected_checkout).toLocaleString()
              : 'N/A'}
          </p>
        </Card>

        <Card className="p-4 bg-gray-50 dark:bg-slate-200/50">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-600 mb-2">
            Current Location
          </h4>
          <p className="text-gray-900 dark:text-slate-900">
            {visitor.current_location || 'Unknown'}
          </p>
        </Card>

        <Card className="p-4 bg-gray-50 dark:bg-slate-200/50">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-600 mb-2">
            Purpose
          </h4>
          <p className="text-gray-900 dark:text-slate-900 text-sm">
            {visitor.purpose}
          </p>
        </Card>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title={visitor?.name}>
      <div className="space-y-6">
        {/* Tabs */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content */}
        {activeTab === 'details' && (
          <>
            {renderDetails()}

            {/* Extend Visitor Form */}
            {showExtendForm && visitor.status === 'checked_in' && (
              <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
                  Extend Visit Duration
                </h4>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="24"
                    value={extendHours}
                    onChange={(e) => setExtendHours(e.target.value)}
                    placeholder="Hours to extend"
                    label="Hours"
                  />
                  <div className="flex items-end gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        onExtend?.(visitor, parseInt(extendHours, 10));
                        setShowExtendForm(false);
                      }}
                      disabled={isLoading}
                    >
                      Extend
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowExtendForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}

        {activeTab === 'timeline' && (
          <VisitorTimeline
            visitorId={visitor.id}
            visitorName={visitor.name}
          />
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-slate-300 flex-wrap">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Close
          </Button>

          {visitor.status === 'checked_in' && (
            <>
              {onExtend && !showExtendForm && (
                <Button
                  variant="secondary"
                  onClick={() => setShowExtendForm(true)}
                  disabled={isLoading}
                >
                  Extend Stay
                </Button>
              )}
              {onCheckOut && (
                <Button
                  variant="primary"
                  onClick={() => onCheckOut(visitor)}
                  disabled={isLoading}
                  isLoading={isLoading}
                >
                  Check Out
                </Button>
              )}
            </>
          )}

          {onDelete && (
            <Button
              variant="danger"
              onClick={() => onDelete(visitor)}
              disabled={isLoading}
            >
              Delete Record
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default VisitorModal;
