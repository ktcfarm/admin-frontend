import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '../utils/cn.js';
import { PaginationBar } from './PaginationBar.jsx';
import { EmptyState } from './EmptyState.jsx';

export function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no records to display.',
  emptyAction,
  sortBy,
  sortOrder = 'asc',
  onSort,
  onRowClick,
  pagination,
  keyField = 'id',
  className = '',
  skeletonRows = 5,
}) {
  const handleHeaderClick = (column) => {
    if (!column.sortable || !onSort) return;
    const isCurrent = sortBy === column.key;
    const nextOrder = isCurrent && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(column.key, nextOrder);
  };

  const getAlignClass = (align) => {
    if (align === 'center') return 'text-center';
    if (align === 'right') return 'text-right';
    return 'text-left';
  };

  return (
    <div
      className={cn(
        'w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col',
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/75">
              {columns.map((column) => {
                const isSorted = sortBy === column.key;
                const alignClass = getAlignClass(column.align);

                return (
                  <th
                    key={column.key}
                    scope="col"
                    style={column.width ? { width: column.width } : undefined}
                    onClick={() => handleHeaderClick(column)}
                    className={cn(
                      'px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider select-none',
                      alignClass,
                      column.sortable && 'cursor-pointer hover:bg-gray-100 transition-colors',
                      column.className
                    )}
                  >
                    <div
                      className={cn(
                        'inline-flex items-center gap-1.5',
                        column.align === 'right' && 'flex-row-reverse justify-end',
                        column.align === 'center' && 'justify-center'
                      )}
                    >
                      <span>{column.header}</span>
                      {column.sortable && (
                        <span className="text-gray-400">
                          {isSorted ? (
                            sortOrder === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-[#0E4B2E]" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-[#0E4B2E]" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, rIdx) => (
                <tr key={`skeleton-${rIdx}`} className="animate-pulse">
                  {columns.map((col, cIdx) => (
                    <td key={`skeleton-cell-${cIdx}`} className="px-4 py-3.5">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => {
                const rowKey = row[keyField] ?? rIdx;
                const isClickable = Boolean(onRowClick);

                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick?.(row, rIdx)}
                    className={cn(
                      'transition-colors',
                      isClickable && 'cursor-pointer hover:bg-gray-50/80'
                    )}
                  >
                    {columns.map((column) => {
                      const value = row[column.key];
                      const rendered = column.render
                        ? column.render(value, row, rIdx)
                        : value ?? '—';
                      const alignClass = getAlignClass(column.align);

                      return (
                        <td
                          key={`${rowKey}-${column.key}`}
                          className={cn(
                            'px-4 py-3.5 text-gray-900 whitespace-nowrap',
                            alignClass,
                            column.cellClassName
                          )}
                        >
                          {rendered}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <PaginationBar
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalItems={pagination.totalItems}
          pageSizeOptions={pagination.pageSizeOptions}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
        />
      )}
    </div>
  );
}
