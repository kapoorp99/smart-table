import React, { useState } from "react";
import "../styles/table.css";
import { TableProps } from "../types/tableTypes";
import { getPaginatedData, getSortedData } from "../utils/tableUtils";

export function Table<T>({ data, columns, pageSize = 5 }: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const sortedData = React.useMemo(() => getSortedData(data, sortConfig), [data, sortConfig]);
  const paginatedData = React.useMemo(() => getPaginatedData(sortedData, currentPage, pageSize), [sortedData, currentPage, pageSize]);
  

  const requestSort = (key: keyof T) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) return { key, direction: "asc" };
      return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
    });
  };

  const pageCount = Math.ceil(data.length / pageSize);

  return (
    <div className="smart-table-container">
      <table className="smart-table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th
                key={String(col.accessor)}
                onClick={col.sortable ? () => requestSort(col.accessor) : undefined}
                className={`sticky ${col.frozen ? "freeze" : ""} ${col.sortable ? "sortable" : ""}`}
                style={{
                  left: col.frozen ? `${index * 120}px` : undefined,
                  zIndex: col.frozen ? 1 : 0,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  {col.header}
                  {col.sortable && (
                    <>
                      <span
                        className={`sort-icon ${
                          sortConfig?.key === col.accessor && sortConfig.direction === "asc"
                            ? "active"
                            : ""
                        }`}
                      >
                        ▲
                      </span>
                      <span
                        className={`sort-icon ${
                          sortConfig?.key === col.accessor && sortConfig.direction === "desc"
                            ? "active"
                            : ""
                        }`}
                      >
                        ▼
                      </span>
                    </>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, i) => (
            <tr key={i}>
              {columns.map((col, index) => (
                <td
                  key={String(col.accessor)}
                  className={col.frozen ? "freeze" : ""}
                  style={{
                    left: col.frozen ? `${index * 120}px` : undefined,
                    zIndex: col.frozen ? 2 : 0,
                  }}
                >
                  {col.render ? col.render(row[col.accessor], row) : String(row[col.accessor])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="smart-table-pagination">
        <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
          Prev
        </button>
        <span>
          Page {currentPage} of {pageCount}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
          disabled={currentPage === pageCount}
        >
          Next
        </button>
      </div>
    </div>
  );
}
