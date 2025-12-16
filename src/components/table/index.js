import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import React, { useState } from "react";
import Button from "../button";
import LoadingSpinner from "../loadingSpinner";
import Tooltip from "../tooltip";

const Table = ({
  columns,
  data,
  pagination,
  onPageChange,
  isPagination = true,
  onSort,
  sortConfig,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  onRowClick,
  loading,
  expandable,
  expandRenderer,
  expandedRows = [],
  onToggleExpand,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = pageSize || 12;

  const safeData = Array.isArray(data) ? data : [];
  const safeColumns = Array.isArray(columns) ? columns : [];

  const isServerPagination = pagination && typeof onPageChange === "function";
  let totalPages, currentData, totalItems;

  if (isServerPagination) {
    totalPages =
      pagination?.totalPages ||
      Math.ceil(pagination?.total / pagination?.limit);
    currentData = safeData;
    totalItems = pagination?.total;
  } else if (!isPagination) {
    // When pagination is disabled, show all data
    totalPages = 1;
    currentData = safeData;
    totalItems = safeData.length;
  } else {
    // Client-side pagination
    totalPages = Math.ceil(safeData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    currentData = safeData.slice(startIndex, startIndex + itemsPerPage);
    totalItems = safeData.length;
  }

  const activePage = isServerPagination ? pagination?.page || 1 : currentPage;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      if (isServerPagination) onPageChange(page);
      else setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const current = activePage;

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (totalPages > 1) pages.push(2);
      if (current > 2 && current < totalPages - 1) {
        if (current > 3) pages.push("...");
        pages.push(current);
      }
      if (current < totalPages - 2) pages.push("...");
      if (totalPages > 2) pages.push(totalPages - 1);
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="rounded shadow-sm border border-gray-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr
              className="bg-[var(--color-secondary)] text-[var(--color-bg)]"
              style={{ borderBottom: "2px solid var(--border-color)" }}
            >
              {expandable && <th className="w-10"></th>}
              {safeColumns.map((col, index) => {
                const isSortable = col.sortable;
                const isSorted = sortConfig?.key === col.key;
                const sortDirection = isSorted ? sortConfig.direction : null;

                return (
                  <th
                    key={index}
                    onClick={isSortable ? () => onSort(col.key) : undefined}
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isSortable ? "cursor-pointer select-none" : ""
                      }`}
                  >
                    <div className="flex items-center gap-1">
                      {col.header}
                      {isSortable && (
                        <div className="flex flex-col">
                          <ChevronUp
                            className={`w-3 h-3 ${isSorted && sortDirection === "asc"
                              ? "text-[var(--primary-color-2)]"
                              : "text-gray-400"
                              }`}
                          />
                          <ChevronDown
                            className={`w-3 h-3 -mt-1 ${isSorted && sortDirection === "desc"
                              ? "text-[var(--primary-color-2)]"
                              : "text-gray-400"
                              }`}
                          />
                        </div>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {loading && currentData.length === 0 ? (
              <tr>
                <td
                  colSpan={safeColumns.length + (expandable ? 1 : 0)}
                  className="px-4 py-52 text-center"
                >
                  <div className="flex flex-col items-center">
                    <LoadingSpinner size="large" />
                    <span className="mt-3 text-sm text-gray-500">
                      Loading data...
                    </span>
                  </div>
                </td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td
                  colSpan={safeColumns.length + (expandable ? 1 : 0)}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  No data available
                </td>
              </tr>
            ) : (
              currentData.map((row, rowIndex) => {
                const isExpanded = expandedRows.includes(row._id || row.id);
                return (
                  <React.Fragment key={rowIndex}>
                    <tr
                      className={`transition-all hover:bg-gray-100 ${onRowClick ? "cursor-pointer" : ""
                        }`}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                    >
                      {expandable && (
                        <td className="px-4 py-3 border-b border-gray-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleExpand(row._id || row.id);
                            }}
                            className="p-1 hover:bg-gray-300 rounded"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-600" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </td>
                      )}
                      {safeColumns.map((col, colIndex) => (
                        <td
                          key={colIndex}
                          style={{
                            maxWidth: col.maxWidth || "auto",
                            width: col.maxWidth || "auto",
                          }}
                          className="px-4 py-3 text-sm text-[var(--text-color)] border-b border-gray-200"
                        >
                          {col.render ? (
                            col.render(row)
                          ) : (
                            <Tooltip content={row?.[col.key]} position="top">
                              <span className="block truncate max-w-[200px]">
                                {row?.[col.key]}
                              </span>
                            </Tooltip>
                          )}
                        </td>
                      ))}
                    </tr>
                    {expandable && isExpanded && (
                      <tr>
                        <td
                          colSpan={safeColumns.length + 1}
                          className="px-4 py-4 bg-gray-200 border-b border-gray-200"
                        >
                          {expandRenderer ? expandRenderer(row) : null}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && isPagination && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 py-3  border-t border-gray-200">
          <div className="text-xs sm:text-sm text-gray-700">
            Showing{" "}
            {isServerPagination
              ? `${(pagination.page - 1) * pagination.limit + 1} to ${Math.min(
                pagination.page * pagination.limit,
                pagination.total
              )} of ${pagination.total}`
              : `${(activePage - 1) * itemsPerPage + 1} to ${Math.min(
                activePage * itemsPerPage,
                totalItems
              )} of ${totalItems}`}{" "}
            entries
          </div>
          {pageSizeOptions && onPageSizeChange && (
            <div className="flex items-center gap-2">
              <label className="text-xs sm:text-sm">Page Size:</label>
              <select
                value={pagination?.limit || itemsPerPage}
                onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
                className="px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-2">
            <Button
              label="Prev"
              onClick={() => handlePageChange(activePage - 1)}
              disabled={activePage === 1}
            />

            {getPageNumbers().map((page, index) =>
              page === "..." ? (
                <span key={index} className="px-2 text-gray-500">
                  ...
                </span>
              ) : (
                <button
                  key={index}
                  onClick={() => handlePageChange(page)}
                  className={`px-3.5 text-sm rounded-md cursor-pointer border transition ${activePage === page
                    ? "bg-[var(--color-secondary)] text-white border-[var(--color-secondary)]"
                    : "border-gray-200 text-black"
                    }`}
                >
                  {page}
                </button>
              )
            )}

            <Button
              label="Next"
              onClick={() => handlePageChange(activePage + 1)}
              disabled={activePage === totalPages}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
