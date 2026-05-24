/**
 * @file Table component
 * Data table with sortable columns, pagination, and hover effects
 *
 * @example
 * const columns = [
 *   { key: 'id', label: 'ID', sortable: true },
 *   { key: 'name', label: 'Name', sortable: true },
 *   { key: 'status', label: 'Status', render: (v) => <Badge>{v}</Badge> }
 * ];
 *
 * <Table columns={columns} data={items} />
 *
 * @example
 * // With custom rendering and row click
 * <Table
 *   columns={columns}
 *   data={items}
 *   striped
 *   hoverable
 *   onRowClick={(row) => navigate(`/item/${row.id}`)}
 * />
 */

import React, { useState } from 'react';
import { TableProps, TableColumn } from './types';
import { TRANSITIONS } from './constants';
import Loading from './Loading';

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

/**
 * Table Component
 *
 * A flexible data table with sorting and custom rendering.
 *
 * @param {TableProps} props - Table component props
 * @returns {React.ReactElement} Table element
 */
const Table: React.FC<TableProps> = ({
  columns,
  data,
  striped = false,
  hoverable = true,
  isLoading = false,
  emptyMessage = 'No data available',
  sortable = true,
  onSort,
  onRowClick,
  className = '',
  ...rest
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const handleSort = (key: string) => {
    const newDirection =
      sortConfig?.key === key && sortConfig.direction === 'asc'
        ? 'desc'
        : 'asc';

    setSortConfig({ key, direction: newDirection });
    onSort?.(key, newDirection);
  };

  if (isLoading) {
    return (
      <div className="w-full p-8">
        <Loading text="Loading table data..." />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full p-8 text-center text-gray-500 dark:text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto lg:overflow-visible max-h-[calc(100vh-325px)] lg:max-h-none rounded-lg border border-gray-200 dark:border-slate-700 relative">
      <table
        className={`w-full text-sm text-gray-900 dark:text-white ${className}`}
        role="grid"
        {...rest}
      >
        <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600 sticky top-0 z-10 shadow-[inset_0_-1px_0_rgba(0,0,0,0.1)]">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 font-semibold text-left text-gray-700 dark:text-gray-200 sticky top-0 bg-gray-50 dark:bg-slate-700 z-10"
                style={{ width: column.width }}
                scope="col"
              >
                {column.sortable && sortable ? (
                  <button
                    onClick={() => handleSort(column.key)}
                    className={`flex items-center gap-1 hover:text-gray-900 dark:hover:text-white ${TRANSITIONS.base}`}
                    aria-sort={
                      sortConfig?.key === column.key
                        ? sortConfig.direction === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    {column.label}
                    {sortConfig?.key === column.key && (
                      <svg
                        className={`w-4 h-4 ${
                          sortConfig.direction === 'desc'
                            ? 'rotate-180'
                            : ''
                        } ${TRANSITIONS.base}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                        />
                      </svg>
                    )}
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`border-b border-gray-200 dark:border-slate-700 ${
                striped && rowIndex % 2 === 0
                  ? 'bg-gray-50 dark:bg-slate-800/50'
                  : ''
              } ${
                hoverable
                  ? `hover:bg-gray-100 dark:hover:bg-slate-700 ${TRANSITIONS.base}`
                  : ''
              } ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick?.(row)}
              role="row"
            >
              {columns.map((column) => (
                <td
                  key={`${rowIndex}-${column.key}`}
                  className="px-6 py-4"
                  role="gridcell"
                >
                  {column.render
                    ? column.render(row[column.key], row)
                    : row[column.key] ?? '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
