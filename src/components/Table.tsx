import React, { useState } from "react";
import "../styles/table.css";
import { FaLock, FaLockOpen } from "react-icons/fa";
import { TableProps } from "../types/tableTypes";
import { getPaginatedData, getSortedData } from "../utils/tableUtils";

export function Table<T>({ data, columns, pageSize = 5 }: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [frozenCols, setFrozenCols] = useState<Set<keyof T>>(() => new Set());

  const sortedData = React.useMemo(() => getSortedData(data, sortConfig), [data, sortConfig]);
  const paginatedData = React.useMemo(() => getPaginatedData(sortedData, currentPage, rowsPerPage), [sortedData, currentPage, rowsPerPage]);

  const requestSort = (key: keyof T) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) return { key, direction: "asc" };
      return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
    });
  };

  const toggleFrozen = (key: keyof T) => {
    setFrozenCols(prev => {
      const newSet = new Set(prev);
      newSet.has(key) ? newSet.delete(key) : newSet.add(key);
      return newSet;
    });
  };

  const updatedColumns = React.useMemo(() => {
    return [...columns].sort((a, b) => {
      const aFrozen = frozenCols.has(a.accessor);
      const bFrozen = frozenCols.has(b.accessor);
      return aFrozen === bFrozen ? 0 : aFrozen ? -1 : 1;
    });
  }, [columns, frozenCols]);

  const pageCount = Math.ceil(data.length / rowsPerPage);

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRowsPerPage = parseInt(e.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to the first page when rows per page changes
  };

  const handlePageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentPage(parseInt(e.target.value, 10));
  };

  return (
    <div className="smart-table-container">
      <table className="smart-table">
        <thead>
          <tr>
            {updatedColumns.map((col, index) => {
              const isFrozen = frozenCols.has(col.accessor);
              return (
                <th
                  key={String(col.accessor)}
                  onClick={col.sortable ? () => requestSort(col.accessor) : undefined}
                  className={`sticky ${isFrozen ? "freeze" : ""} ${col.sortable ? "sortable" : ""}`}
                  style={{
                    left: isFrozen ? `${index * 120}px` : undefined,
                    zIndex: isFrozen ? 1 : 0,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {col.header}
                    <span onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering sort
                      toggleFrozen(col.accessor);
                    }} style={{ cursor: "pointer" }}>
                      {isFrozen ? <FaLock /> : <FaLockOpen />}
                    </span>
                    {col.sortable && (
                      <>
                        <span className={`sort-icon ${sortConfig?.key === col.accessor && sortConfig.direction === "asc" ? "active" : ""}`}>▲</span>
                        <span className={`sort-icon ${sortConfig?.key === col.accessor && sortConfig.direction === "desc" ? "active" : ""}`}>▼</span>
                      </>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, i) => (
            <tr key={i}>
              {updatedColumns.map((col, index) => {
                const isFrozen = frozenCols.has(col.accessor);
                return (
                  <td
                    key={String(col.accessor)}
                    className={isFrozen ? "freeze" : ""}
                    style={{
                      left: isFrozen ? `${index * 120}px` : undefined,
                      zIndex: isFrozen ? 2 : 0,
                    }}
                  >
                    {col.render ? col.render(row[col.accessor], row) : String(row[col.accessor])}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="smart-table-pagination">
        <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
          Prev
        </button>
        <span>Page {currentPage} of {pageCount}</span>
        <button onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))} disabled={currentPage === pageCount}>
          Next
        </button>
        <div>
          <label htmlFor="page-selector">Go to page:</label>
          <select
            id="page-selector"
            value={currentPage}
            onChange={handlePageChange}
          >
            {Array.from({ length: pageCount }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="rows-per-page-selector">Rows per page:</label>
          <select
            id="rows-per-page-selector"
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
