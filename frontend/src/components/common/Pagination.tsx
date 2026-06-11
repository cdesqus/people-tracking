/**
 * @file Pagination component
 * Page navigation component with quick jumper and page size selector
 *
 * @example
 * <Pagination
 *   currentPage={currentPage}
 *   totalPages={totalPages}
 *   onPageChange={setCurrentPage}
 * />
 *
 * @example
 * // With quick jumper and page size selector
 * <Pagination
 *   currentPage={page}
 *   totalPages={totalPages}
 *   totalItems={totalItems}
 *   pageSize={pageSize}
 *   onPageChange={setPage}
 *   showQuickJumper
 *   showPageSizeSelector
 * />
 */

import React, { useState } from 'react';
import { PaginationProps } from './types';
import { TRANSITIONS } from './constants';
import Input from './Input';

/**
 * Pagination Component
 *
 * A pagination control for navigating through pages of data.
 *
 * @param {PaginationProps} props - Pagination component props
 * @returns {React.ReactElement} Pagination element
 */
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize = 10,
  totalItems,
  onPageChange,
  showQuickJumper = false,
  showPageSizeSelector = false,
  className = '',
  ...rest
}) => {
  const [jumpPage, setJumpPage] = useState(currentPage.toString());

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleJump = () => {
    const page = parseInt(jumpPage, 10);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    } else {
      setJumpPage(currentPage.toString());
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
      {...rest}
    >
      {/* Left info section */}
      <div className="text-sm text-gray-600 dark:text-slate-500">
        {totalItems && (
          <p>
            Showing page {currentPage} of {totalPages}
            {totalItems && ` (${totalItems} total items)`}
          </p>
        )}
      </div>

      {/* Center pagination controls */}
      <div className="flex items-center gap-2 justify-center sm:justify-start">
        {/* Previous button */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-300 text-gray-900 dark:text-slate-900 text-sm font-medium ${
            currentPage === 1
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-gray-100 dark:hover:bg-slate-200'
          } ${TRANSITIONS.base}`}
          aria-label="Previous page"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-2 text-gray-600 dark:text-slate-500"
                >
                  {page}
                </span>
              );
            }

            const isActive = page === currentPage;
            return (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                  isActive
                    ? 'bg-sky-500 text-white border-sky-500'
                    : 'border-gray-300 dark:border-slate-300 text-gray-900 dark:text-slate-900 hover:bg-gray-100 dark:hover:bg-slate-200'
                } ${TRANSITIONS.base}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-300 text-gray-900 dark:text-slate-900 text-sm font-medium ${
            currentPage === totalPages
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-gray-100 dark:hover:bg-slate-200'
          } ${TRANSITIONS.base}`}
          aria-label="Next page"
        >
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Right options section */}
      <div className="flex items-center gap-4 justify-center sm:justify-end">
        {showPageSizeSelector && (
          <div className="flex items-center gap-2 text-sm">
            <label
              htmlFor="page-size"
              className="text-gray-600 dark:text-slate-500"
            >
              Per page:
            </label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => {
                // Implement page size change in parent
              }}
              className="px-2 py-1 border border-gray-300 dark:border-slate-300 rounded bg-white dark:bg-slate-100 text-gray-900 dark:text-slate-900 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}

        {showQuickJumper && (
          <div className="flex items-center gap-2 text-sm">
            <label
              htmlFor="quick-jump"
              className="text-gray-600 dark:text-slate-500"
            >
              Go to:
            </label>
            <div className="flex gap-1">
              <input
                id="quick-jump"
                type="number"
                min="1"
                max={totalPages}
                value={jumpPage}
                onChange={(e) => setJumpPage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJump()}
                className="w-12 px-2 py-1 border border-gray-300 dark:border-slate-300 rounded bg-white dark:bg-slate-100 text-gray-900 dark:text-slate-900 text-sm"
              />
              <button
                onClick={handleJump}
                className="px-2 py-1 bg-sky-500 text-white rounded text-sm font-medium hover:bg-sky-600 transition-colors"
              >
                Go
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagination;
