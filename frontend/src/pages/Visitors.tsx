/**
 * Visitor Management Page
 * Main page for managing visitor check-ins, check-outs, and tracking
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@store/store';
import {
  fetchVisitorsStart,
  fetchVisitorsSuccess,
  fetchVisitorsError,
  checkInVisitorStart,
  checkInVisitorSuccess,
  checkInVisitorError,
  checkOutVisitorStart,
  checkOutVisitorSuccess,
  checkOutVisitorError,
  updateVisitorStart,
  updateVisitorSuccess,
  updateVisitorError,
  selectVisitor,
  setCurrentPage,
  setSearchTerm,
  setStatusFilter,
  clearSuccess,
  clearError,
} from '@store/slices/visitorSlice';
import VisitorCheckInForm from '@components/visitors/VisitorCheckInForm';
import VisitorList from '@components/visitors/VisitorList';
import VisitorModal from '@components/visitors/VisitorModal';
import Alert from '@components/common/Alert';
import Card from '@components/common/Card';
import Tabs from '@components/common/Tabs';
import Button from '@components/common/Button';
import Modal from '@components/common/Modal';
import { Visitor } from '@/types/management';

const VisitorsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    visitors,
    selectedVisitor,
    loading,
    error,
    success,
    currentPage,
    pageSize,
    searchTerm,
    statusFilter,
  } = useAppSelector((state) => state.visitors);

  const [activeTab, setActiveTab] = useState('active');
  const [showModal, setShowModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  // Fetch visitors on mount and when filters change
  const fetchVisitors = useCallback(async () => {
    dispatch(fetchVisitorsStart());
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('page_size', pageSize.toString());
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/visitors?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch visitors');

      const data = await response.json();
      dispatch(
        fetchVisitorsSuccess({
          visitors: data.items || [],
          total: data.total || 0,
        })
      );
    } catch (err) {
      dispatch(
        fetchVisitorsError(
          err instanceof Error ? err.message : 'Error fetching visitors'
        )
      );
    }
  }, [dispatch, currentPage, pageSize, searchTerm, statusFilter]);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  // Auto-dismiss messages
  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => dispatch(clearSuccess()), 3000);
    return () => clearTimeout(timer);
  }, [success, dispatch]);

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => dispatch(clearError()), 3000);
    return () => clearTimeout(timer);
  }, [error, dispatch]);

  // Handle check-in
  const handleCheckInVisitor = async (
    formData: Omit<Visitor, 'id' | 'created_at' | 'updated_at' | 'check_in_time' | 'status'> & { photo?: File }
  ): Promise<Visitor> => {
    dispatch(checkInVisitorStart());
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('organization', formData.organization);
      data.append('purpose', formData.purpose);
      data.append('host', formData.host);
      data.append('phone', formData.phone);
      data.append('email', formData.email);
      if (formData.expected_checkout) {
        data.append('expected_checkout', formData.expected_checkout);
      }
      if (formData.photo) {
        data.append('photo', formData.photo);
      }

      const response = await fetch('/api/visitors/checkin', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) throw new Error('Failed to check in visitor');

      const visitor = await response.json();
      dispatch(checkInVisitorSuccess(visitor));
      return visitor;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error checking in visitor';
      dispatch(checkInVisitorError(message));
      throw err;
    }
  };

  // Handle check-out
  const handleCheckOutVisitor = async (visitor: Visitor) => {
    dispatch(checkOutVisitorStart());
    try {
      const response = await fetch(`/api/visitors/${visitor.id}/checkout`, {
        method: 'PUT',
      });

      if (!response.ok) throw new Error('Failed to check out visitor');

      const updatedVisitor = await response.json();
      dispatch(checkOutVisitorSuccess(updatedVisitor));
      setShowModal(false);
    } catch (err) {
      dispatch(
        checkOutVisitorError(
          err instanceof Error ? err.message : 'Error checking out visitor'
        )
      );
    }
  };

  // Handle extend stay
  const handleExtendVisit = async (visitor: Visitor, hours: number = 1) => {
    dispatch(updateVisitorStart());
    try {
      const response = await fetch(`/api/visitors/${visitor.id}/extend`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours }),
      });

      if (!response.ok) throw new Error('Failed to extend visitor stay');

      const updatedVisitor = await response.json();
      dispatch(updateVisitorSuccess(updatedVisitor));
    } catch (err) {
      dispatch(
        updateVisitorError(
          err instanceof Error ? err.message : 'Error extending visit'
        )
      );
    }
  };

  // Stats
  const stats = {
    totalToday: visitors.filter((v) =>
      new Date(v.check_in_time).toDateString() === new Date().toDateString()
    ).length,
    checkedIn: visitors.filter((v) => v.status === 'checked_in').length,
    checkedOut: visitors.filter((v) => v.status === 'checked_out').length,
    expired: visitors.filter((v) => v.status === 'expired').length,
  };

  const tabs = [
    { id: 'active', label: `Active Visitors (${stats.checkedIn})` },
    { id: 'history', label: `History (${stats.checkedOut + stats.expired})` },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-900">
            Visitor Management
          </h1>
          <p className="text-gray-600 dark:text-slate-500 mt-1">
            Manage visitor check-ins, check-outs, and track movements
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCheckInModal(true)}>
          + Tambah Tamu (Check-In)
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800">
          <h4 className="text-sm font-semibold text-sky-900 dark:text-sky-200 mb-1">
            Today's Visitors
          </h4>
          <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">
            {stats.totalToday}
          </p>
        </Card>
        <Card className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <h4 className="text-sm font-semibold text-green-900 dark:text-green-200 mb-1">
            Checked In
          </h4>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.checkedIn}
          </p>
        </Card>
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
            Checked Out
          </h4>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-600">
            {stats.checkedOut}
          </p>
        </Card>
        <Card className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <h4 className="text-sm font-semibold text-red-900 dark:text-red-200 mb-1">
            Expired
          </h4>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.expired}
          </p>
        </Card>
      </div>

      {/* Alerts */}
      {success && (
        <Alert
          type="success"
          title="Success"
          message={success}
          onDismiss={() => dispatch(clearSuccess())}
        />
      )}
      {error && (
        <Alert
          type="error"
          title="Error"
          message={error}
          onDismiss={() => dispatch(clearError())}
        />
      )}

      {/* Tabs */}
      <Card>
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </Card>

      {/* Tab Content */}
      {activeTab === 'active' && (
        <VisitorList
          visitors={visitors.filter((v) => v.status === 'checked_in')}
          isLoading={loading}
          currentPage={currentPage}
          pageSize={pageSize}
          total={visitors.filter((v) => v.status === 'checked_in').length}
          searchTerm={searchTerm}
          statusFilter="checked_in"
          onPageChange={(page) => dispatch(setCurrentPage(page))}
          onSearchChange={(term) => dispatch(setSearchTerm(term))}
          onStatusFilterChange={(status) => dispatch(setStatusFilter(status))}
          onRowClick={(visitor) => {
            dispatch(selectVisitor(visitor));
            setShowModal(true);
          }}
          onCheckOut={handleCheckOutVisitor}
          onExtend={handleExtendVisit}
        />
      )}



      {activeTab === 'history' && (
        <VisitorList
          visitors={visitors.filter(
            (v) => v.status === 'checked_out' || v.status === 'expired'
          )}
          isLoading={loading}
          currentPage={currentPage}
          pageSize={pageSize}
          total={visitors.filter(
            (v) => v.status === 'checked_out' || v.status === 'expired'
          ).length}
          searchTerm={searchTerm}
          statusFilter="all"
          onPageChange={(page) => dispatch(setCurrentPage(page))}
          onSearchChange={(term) => dispatch(setSearchTerm(term))}
          onStatusFilterChange={(status) => dispatch(setStatusFilter(status))}
          onRowClick={(visitor) => {
            dispatch(selectVisitor(visitor));
            setShowModal(true);
          }}
        />
      )}

      {/* Visitor Details Modal */}
      <VisitorModal
        isOpen={showModal}
        visitor={selectedVisitor}
        onClose={() => setShowModal(false)}
        onCheckOut={handleCheckOutVisitor}
        onExtend={handleExtendVisit}
        isLoading={loading}
      />

      {/* Visitor Check-In Modal */}
      <Modal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        size="lg"
        title="Tambah Tamu (Check-In)"
      >
        <VisitorCheckInForm
          onSubmit={handleCheckInVisitor}
          isLoading={loading}
          onCancel={() => setShowCheckInModal(false)}
          onSuccess={() => {
            setShowCheckInModal(false);
            fetchVisitors();
          }}
        />
      </Modal>
    </div>
  );
};

export default VisitorsPage;
