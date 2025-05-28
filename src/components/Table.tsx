import React, { useState } from 'react';
import '../styles/Table.css';

interface Column<T> {
  key: keyof T;
  title: string;
  render?: (value: any, record: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (record: T) => void;
  isLoading?: boolean;
  pagination?: {
    pageSize: number;
    currentPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
  selectedRows?: T[];
  onSelectRow?: (record: T) => void;
}

const Table = <T extends { id: string | number }>({
  data,
  columns,
  onRowClick,
  isLoading,
  pagination,
  selectedRows = [],
  onSelectRow,
}: TableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleSort = (key: keyof T) => {
    setSortConfig(current => ({
      key,
      direction: current?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            {onSelectRow && (
              <th className="checkbox-column">
                <input
                  type="checkbox"
                  onChange={() => {/* Handle select all */}}
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={String(column.key)}
                style={{ width: column.width }}
                className={column.sortable ? 'sortable' : ''}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="th-content">
                  {column.title}
                  {column.sortable && (
                    <span className={`sort-icon ${
                      sortConfig?.key === column.key ? sortConfig.direction : ''
                    }`}>
                      ↕
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length + (onSelectRow ? 1 : 0)}>
                <div className="loading-spinner">Loading...</div>
              </td>
            </tr>
          ) : (
            sortedData.map((record) => (
              <tr
                key={record.id}
                onClick={() => onRowClick?.(record)}
                className={`
                  ${onRowClick ? 'clickable' : ''}
                  ${selectedRows.includes(record) ? 'selected' : ''}
                `}
              >
                {onSelectRow && (
                  <td className="checkbox-column">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(record)}
                      onChange={() => onSelectRow(record)}
                      onClick={e => e.stopPropagation()}
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={String(column.key)}>
                    {column.render
                      ? column.render(record[column.key], record)
                      : (record[column.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pagination && (
        <div className="pagination">
          <button
            disabled={pagination.currentPage === 1}
            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            className="pagination-button"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {pagination.currentPage} of{' '}
            {Math.ceil(pagination.totalItems / pagination.pageSize)}
          </span>
          <button
            disabled={
              pagination.currentPage ===
              Math.ceil(pagination.totalItems / pagination.pageSize)
            }
            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Table;