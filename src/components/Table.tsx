import React, { useId, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "../styles/table.css";
import { FaLock, FaLockOpen } from "react-icons/fa";
import { TableProps } from "../types/tableTypes";
import { getPaginatedData, getSortedData } from "../utils/tableUtils";

function SortableRow<T>({
  row,
  columns,
  frozenCols,
}: {
  row: T;
  columns: any[];
  frozenCols: Set<keyof T>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: (row as any).id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {columns.map((col, index) => {
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
  );
}


export function Table<T extends { id: string }>({
  data,
  columns,
  pageSize = 5,
  currentPage: propCurrentPage = 1,
  tableTitle,
  tableSubtitle,
  draggableRows = false
}: TableProps<T>) {
  const id = useId()
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(propCurrentPage);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [frozenCols, setFrozenCols] = useState<Set<keyof T>>(() => new Set());
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
    () => Object.fromEntries(columns.map((col) => [String(col.accessor), col.visible ?? true]))
  );
  const [rowOrder, setRowOrder] = useState(data.map((row) => row.id)); // assuming each row has a unique `id`

  const sortedData = React.useMemo(() => getSortedData(data, sortConfig), [data, sortConfig]);

  const orderedData = rowOrder.map((id) => sortedData.find((row) => row.id === id)!);

  const paginatedData = React.useMemo(
    () => getPaginatedData(orderedData, currentPage, rowsPerPage),
    [orderedData, currentPage, rowsPerPage]
  );

  const updatedColumns = React.useMemo(() => {
    return [...columns]
      .filter((col) => columnVisibility[String(col.accessor)])
      .sort((a, b) => {
        const aFrozen = frozenCols.has(a.accessor);
        const bFrozen = frozenCols.has(b.accessor);
        return aFrozen === bFrozen ? 0 : aFrozen ? -1 : 1;
      });
  }, [columns, frozenCols, columnVisibility]);

  const requestSort = (key: keyof T) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) return { key, direction: "asc" };
      return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
    });
  };

  const toggleFrozen = (key: keyof T) => {
    setFrozenCols((prev) => {
      const newSet = new Set(prev);
      newSet.has(key) ? newSet.delete(key) : newSet.add(key);
      return newSet;
    });
  };

  const toggleColumnVisibility = (key: string) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRowsPerPage = parseInt(e.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  const handlePageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentPage(parseInt(e.target.value, 10));
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = rowOrder.indexOf(active.id);
      const newIndex = rowOrder.indexOf(over.id);
      setRowOrder((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <div className="smart-table-container">
      {tableTitle && <h3>{tableTitle}</h3>}
      {tableSubtitle && <h4>{tableSubtitle}</h4>}

      <div className="table-configurator">
        <h4>Table Configurator</h4>
        {columns.map((col) => (
          <div key={String(col.accessor)}>
            <label>
              <input
                type="checkbox"
                checked={columnVisibility[String(col.accessor)]}
                onChange={() => toggleColumnVisibility(String(col.accessor))}
              />
              {col.header}
            </label>
          </div>
        ))}
      </div>

      {data.length === 0 ? (
        <div className="empty-state"><p>No data available</p></div>
      ) : (
        <div className="">
          {draggableRows ? (

            <DndContext
              key={id}
              id={id}
              sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFrozen(col.accessor);
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              {isFrozen ? <FaLock /> : <FaLockOpen />}
                            </span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  <SortableContext
                    id={`sortable-rows-${id}`}
                    items={paginatedData.map(row => row.id)}
                    strategy={verticalListSortingStrategy}>
                    {paginatedData.map((row) => (
                      <SortableRow
                        frozenCols={frozenCols}
                        key={row.id} row={row} columns={updatedColumns} />
                    ))}
                  </SortableContext>
                </tbody>
              </table>
            </DndContext>
          ) : (
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
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFrozen(col.accessor);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {isFrozen ? <FaLock /> : <FaLockOpen />}
                          </span>
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
          )}
          <div className="smart-table-pagination">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</button>
            <span>Page {currentPage} of {Math.ceil(data.length / rowsPerPage)}</span>
            <button onClick={() => setCurrentPage((p) => Math.min(Math.ceil(data.length / rowsPerPage), p + 1))} disabled={currentPage === Math.ceil(data.length / rowsPerPage)}>Next</button>
            <div>
              <label htmlFor="page-selector">Current page:</label>
              <select id="page-selector" value={currentPage} onChange={handlePageChange}>
                {Array.from({ length: Math.ceil(data.length / rowsPerPage) }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="rows-per-page-selector">Rows per page:</label>
              <select id="rows-per-page-selector" value={rowsPerPage} onChange={handleRowsPerPageChange}>
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
