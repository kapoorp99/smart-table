import React, { useState } from "react";
import "../styles/table.css";
import { FaLock, FaLockOpen } from "react-icons/fa";
import { TableProps } from "../types/tableTypes";
import { getPaginatedData, getSortedData } from "../utils/tableUtils";

export function Table<T>({ data, columns, pageSize = 5 }: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [frozenCols, setFrozenCols] = useState<Set<keyof T>>(() => new Set());

  const sortedData = React.useMemo(() => getSortedData(data, sortConfig), [data, sortConfig]);
  const paginatedData = React.useMemo(() => getPaginatedData(sortedData, currentPage, pageSize), [sortedData, currentPage, pageSize]);

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

  const pageCount = Math.ceil(data.length / pageSize);

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
      </div>
    </div>
  );
}
