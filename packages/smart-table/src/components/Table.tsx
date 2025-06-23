import React, { useId, useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from 'react-i18next';
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
  arrayMove
} from "@dnd-kit/sortable";
import { TableVirtuoso } from 'react-virtuoso';
import "../styles/table.css";
import { FaLock, FaLockOpen, FaSort, FaArrowUp, FaArrowDown, FaFilter, FaTimes, FaLayerGroup, FaLanguage, FaColumns, FaFileExport, FaBroom } from "react-icons/fa";
import { TableProps, Column } from "../types/tableTypes";
import { getPaginatedData, getSortedData, groupData } from "../utils/tableUtils";
import { SortableRow } from "./SortableRow";
import { exportToCSV, exportToXLSX } from "../utils/exportUtils";
import ChatBox from "./ChatBox";
import LanguageSwitcher from "./LanguageSwitcher";
import i18n from "../utils/i18n";

export function Table<T extends { id: string }>({
  data,
  columns,
  pageSize = 5,
  currentPage: propCurrentPage = 1,
  tableTitle,
  tableSubtitle,
  draggableRows = false,
  selectableRows = false,
  onRowSelectChange,
  stickyHeader = false,
  allowExport = false,
  exportFileName = "exported_data",
  exportFileType = "csv",
  enableChatWithTable = false,
  openaiApiKey = "",
  geminiApiKey = "",
  aiProvider = "gemini",
  onChat,
  showLanguageSwitcher = false,
  language,
  enableVirtualization = true,
  cacheKey, // New prop
  loading = false,
  rowActions,
}: TableProps<T> & { loading?: boolean; rowActions?: (row: T) => React.ReactNode }) {
  const { t } = useTranslation();
  const id = useId();
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(propCurrentPage);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [groupBy, setGroupBy] = useState<string | null>(null);
  const [frozenCols, setFrozenCols] = useState<Set<keyof T>>(() =>
    new Set(columns.filter((col) => col.frozen).map((col) => col.accessor))
  );
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
    () => Object.fromEntries(columns.map((col) => [String(col.accessor), true]))
  );
  const [rowOrder, setRowOrder] = useState(data.map((row) => row.id));
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [filterValues, setFilterValues] = useState<Record<string, string | string[]>>({});
  const [filterTypes, setFilterTypes] = useState<Record<string, "search" | "checkbox">>(
    () => Object.fromEntries(columns.map((col) => [String(col.accessor), "search"]))
  );

  // Header caching logic
  const headerCacheKey = cacheKey || `table-headers-${tableTitle || id}`;
  const [cachedColumns, setCachedColumns] = useState<Column<T>[]>(columns);

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    // Try to load from localStorage
    try {
      const cached = localStorage.getItem(`${headerCacheKey}-widths`);
      if (cached) return JSON.parse(cached);
    } catch {}
    // Default width
    return Object.fromEntries(columns.map((col) => [String(col.accessor), 120]));
  });

  // Persist column widths
  useEffect(() => {
    try {
      localStorage.setItem(`${headerCacheKey}-widths`, JSON.stringify(columnWidths));
    } catch {}
  }, [columnWidths, headerCacheKey]);

  // Column resize logic
  const resizingCol = useRef<string | null>(null);
  const startX = useRef<number>(0);
  const startWidth = useRef<number>(0);

  const handleResizeStart = (e: React.MouseEvent, key: string) => {
    resizingCol.current = key;
    startX.current = e.clientX;
    startWidth.current = columnWidths[key] || 120;
    document.body.style.cursor = 'col-resize';
    window.addEventListener('mousemove', handleResizing);
    window.addEventListener('mouseup', handleResizeEnd);
  };

  const handleResizing = (e: MouseEvent) => {
    if (!resizingCol.current) return;
    const diff = e.clientX - startX.current;
    setColumnWidths((prev) => {
      const newWidth = Math.max(60, startWidth.current + diff);
      return { ...prev, [resizingCol.current!]: newWidth };
    });
  };

  const handleResizeEnd = () => {
    resizingCol.current = null;
    document.body.style.cursor = '';
    window.removeEventListener('mousemove', handleResizing);
    window.removeEventListener('mouseup', handleResizeEnd);
  };

  useEffect(() => {
    // Retrieve cached headers
    try {
      const cached = localStorage.getItem(headerCacheKey);
      if (cached) {
        const parsedColumns: Column<T>[] = JSON.parse(cached);
        // Merge cached columns with provided columns to ensure consistency
        const mergedColumns = columns.map((col) => {
          const cachedCol = parsedColumns.find((c) => c.accessor === col.accessor);
          return cachedCol ? { ...col, ...cachedCol } : col;
        });
        setCachedColumns(mergedColumns);

        // Update column visibility and frozen state from cache
        const visibility = Object.fromEntries(
          mergedColumns.map((col) => [String(col.accessor), col.visible !== false])
        );
        setColumnVisibility(visibility);

        const frozen = new Set(
          mergedColumns.filter((col) => col.frozen).map((col) => col.accessor)
        );
        setFrozenCols(frozen);
      } else {
        // Cache headers if not already cached
        if (cacheKey) {
          localStorage.setItem(headerCacheKey, JSON.stringify(columns));
          setCachedColumns(columns);
        }
      }
    } catch (error) {
      console.error("Error accessing localStorage for header caching:", error);
      setCachedColumns(columns);
    }
  }, [headerCacheKey]);

  // Update cache when columns change
  useEffect(() => {
    try {
      const updatedColumns = cachedColumns.map((col) => ({
        ...col,
        visible: columnVisibility[String(col.accessor)],
        frozen: frozenCols.has(col.accessor),
      }));
      localStorage.setItem(headerCacheKey, JSON.stringify(updatedColumns));
      setCachedColumns(updatedColumns);
    } catch (error) {
      console.error("Error updating header cache:", error);
    }
  }, [columnVisibility, frozenCols, headerCacheKey]);

  // Clear cache function
  const clearHeaderCache = () => {
    try {
      localStorage.removeItem(headerCacheKey);
      setCachedColumns(columns);
      setColumnVisibility(Object.fromEntries(columns.map((col) => [String(col.accessor), true])));
      setFrozenCols(new Set(columns.filter((col) => col.frozen).map((col) => col.accessor)));
    } catch (error) {
      console.error("Error clearing header cache:", error);
    }
  };

  const isRowSelected = (id: string) => selectedRowIds.has(id);

  const toggleRowSelection = (id: string) => {
    setSelectedRowIds((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (paginatedData.every((row) => selectedRowIds.has(row.id))) {
      setSelectedRowIds((prev) => {
        const newSet = new Set(prev);
        paginatedData.forEach((row) => newSet.delete(row.id));
        return newSet;
      });
    } else {
      setSelectedRowIds((prev) => {
        const newSet = new Set(prev);
        paginatedData.forEach((row) => newSet.add(row.id));
        return newSet;
      });
    }
  };

  React.useEffect(() => {
    if (language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  React.useEffect(() => {
    onRowSelectChange?.(data.filter((row) => selectedRowIds.has(row.id)));
  }, [selectedRowIds, data, onRowSelectChange]);

  // Derive unique filter options for checkbox filters
  const filterOptions = useMemo(() => {
    const options: Record<string, string[]> = {};
    cachedColumns.forEach((col) => {
      if (col.filterable) {
        const uniqueValues = [...new Set(data.map((row) => String(row[col.accessor])))]
          .filter((value) => value !== "" && value !== null && value !== undefined)
          .sort();
        options[String(col.accessor)] = uniqueValues;
      }
    });
    return options;
  }, [data, cachedColumns]);

  // Filter data based on filterValues
  const filteredData = useMemo(() => {
    if (!Object.values(filterValues).some((val) =>
      (typeof val === "string" && val.trim() !== "") || (Array.isArray(val) && val.length > 0)
    )) return data;

    return data.filter((row) =>
      Object.entries(filterValues).every(([key, value]) => {
        const column = cachedColumns.find((col) => String(col.accessor) === key);
        if (!column || !column.filterable) return true;

        if (typeof value === "string") {
          // Search filter
          if (!value.trim()) return true;
          const cellValue = String(row[key as keyof T]).toLowerCase();
          return cellValue.includes(value.toLowerCase());
        } else if (Array.isArray(value)) {
          // Checkbox filter
          if (value.length === 0) return true;
          const cellValue = String(row[key as keyof T]);
          return value.includes(cellValue);
        }
        return true;
      })
    );
  }, [data, filterValues, cachedColumns]);

  const sortedData = React.useMemo(() => getSortedData(filteredData, sortConfig), [filteredData, sortConfig]);

  const orderedData = rowOrder
    .filter((id) => sortedData.find((row) => row.id === id))
    .map((id) => sortedData.find((row) => row.id === id)!);

  const currentPageData = React.useMemo(
    () => getPaginatedData(orderedData, currentPage, rowsPerPage),
    [orderedData, currentPage, rowsPerPage]
  );

  const paginatedData = React.useMemo(() => {
    if (draggableRows || !sortConfig) return currentPageData;
    return getSortedData(currentPageData, sortConfig);
  }, [currentPageData, sortConfig, draggableRows, rowsPerPage]);

  const updatedColumns = React.useMemo(() => {
    return cachedColumns.filter((col) => columnVisibility[String(col.accessor)]).sort((a, b) => {
      const aFrozen = frozenCols.has(a.accessor);
      const bFrozen = frozenCols.has(b.accessor);
      return aFrozen === bFrozen ? 0 : aFrozen ? -1 : 1;
    });
  }, [cachedColumns, frozenCols, columnVisibility]);

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

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

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
    setSortConfig(null);
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

  const handleExport = () => {
    const visibleColumns = updatedColumns.map(col => String(col.accessor));
    const exportData = filteredData.map(row => {
      const rowData: any = {};
      visibleColumns.forEach(col => {
        rowData[col] = row[col];
      });
      return rowData;
    });

    if (exportFileType === "csv") exportToCSV(exportData, visibleColumns, exportFileName);
    if (exportFileType === "xlsx") exportToXLSX(exportData, visibleColumns, exportFileName);
  };

  const groupedData = React.useMemo(() => {
    if (groupBy) {
      return groupData(paginatedData, groupBy as keyof T);
    }
    return null;
  }, [paginatedData, groupBy]);

  const handleFilterChange = (key: string, value: string | string[]) => {
    setFilterValues((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const handleFilterTypeChange = (key: string, type: "search" | "checkbox") => {
    setFilterTypes((prev) => ({
      ...prev,
      [key]: type,
    }));
    // Reset filter value when switching filter type
    setFilterValues((prev) => ({
      ...prev,
      [key]: type === "search" ? "" : [],
    }));
  };

  const clearFilters = () => {
    setFilterValues({});
    setCurrentPage(1);
  };

  React.useEffect(() => {
    if (draggableRows && sortConfig) {
      setSortConfig(null);
    }
  }, [draggableRows]);

  // Remove showFilterPanel state
  // Add state for which column's filter popover is open
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null);
  const filterAnchorRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Helper to close popover on outside click
  useEffect(() => {
    if (!openFilterKey) return;
    const handleClick = (e: MouseEvent) => {
      const anchor = filterAnchorRefs.current[openFilterKey];
      if (anchor && !anchor.contains(e.target as Node)) {
        setOpenFilterKey(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openFilterKey]);

  // Render row component
  const renderRow = (index: number) => {
    const row = paginatedData[index];
    if (!row) return null;

    if (draggableRows) {
      return (
        <SortableRow
          key={row.id}
          row={row}
          columns={updatedColumns}
          frozenCols={frozenCols}
          selectable={selectableRows}
          isSelected={isRowSelected(row.id)}
          onSelect={() => toggleRowSelection(row.id)}
          style={{ display: 'table-row' }}
          columnWidths={columnWidths}
        >
          {rowActions && <td style={{ minWidth: 80 }}>{rowActions(row)}</td>}
        </SortableRow>
      );
    }

    return (
      <tr key={row.id} style={{ display: 'table-row' }}>
        {selectableRows && (
          <td style={{ width: 40, minWidth: 40 }}>
            <input
              type="checkbox"
              checked={isRowSelected(row.id)}
              onChange={() => toggleRowSelection(row.id)}
            />
          </td>
        )}
        {updatedColumns.map((col, colIndex) => {
          const isFrozen = frozenCols.has(col.accessor);
          const key = String(col.accessor);
          const filterable = col.filterable;
          return (
            <td
              key={key}
              className={isFrozen ? "freeze" : ""}
              style={{
                left: isFrozen ? `${colIndex * 120}px` : undefined,
                zIndex: isFrozen ? 2 : 0,
                position: isFrozen ? 'sticky' : undefined,
                width: columnWidths[key],
                minWidth: 60,
                maxWidth: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {col.render
                ? col.render(row[col.accessor], row)
                : String(row[col.accessor])}
            </td>
          );
        })}
        {rowActions && <td style={{ minWidth: 80 }}>{rowActions(row)}</td>}
      </tr>
    );
  };

  // Render header row
  const renderHeader = () => (
    <tr>
      {selectableRows && (
        <th style={{ width: 40, minWidth: 40 }}>
          <input
            type="checkbox"
            onChange={toggleSelectAll}
            checked={paginatedData.length > 0 && paginatedData.every((row) => selectedRowIds.has(row.id))}
            ref={(el) => {
              if (el) {
                el.indeterminate =
                  paginatedData.some((row) => selectedRowIds.has(row.id)) &&
                  !paginatedData.every((row) => selectedRowIds.has(row.id));
              }
            }}
          />
        </th>
      )}
      {draggableRows && <th style={{ width: 40, minWidth: 40 }} />}
      {updatedColumns.map((col, index) => {
        const isFrozen = frozenCols.has(col.accessor);
        const key = String(col.accessor);
        const filterable = col.filterable;
        return (
          <th
            key={key}
            onClick={(!draggableRows && col.sortable) ? () => requestSort(col.accessor) : undefined}
            className={`${isFrozen ? "freeze" : ""} ${!draggableRows && col.sortable ? "sortable" : ""}`}
            style={{
              left: isFrozen ? `${index * 120}px` : undefined,
              position: isFrozen ? 'sticky' : undefined,
              zIndex: isFrozen ? 3 : 1,
              background: stickyHeader ? 'white' : undefined,
              top: stickyHeader ? 0 : undefined,
              width: columnWidths[key],
              minWidth: 60,
              maxWidth: 600,
              userSelect: 'none',
              paddingRight: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", position: 'relative' }}>
              <span style={{ flex: 1 }}>{col.header}</span>
              {/* Sort icons */}
              {!draggableRows && col.sortable && (
                sortConfig ? (
                  <span style={{ cursor: "pointer" }} onClick={() => requestSort(col.accessor)}>
                    {sortConfig?.key === col.accessor &&
                      (sortConfig.direction === "asc" ? <FaArrowDown /> : <FaArrowUp />)}
                  </span>
                ) : (
                  <span style={{ cursor: "pointer" }} onClick={() => requestSort(col.accessor)}>
                    <FaSort />
                  </span>
                )
              )}
              {/* Filter icon */}
              {filterable && (
                <div
                  ref={el => { filterAnchorRefs.current[key] = el; }}
                  style={{ display: 'inline-block', position: 'relative' }}
                >
                  <span
                    style={{ cursor: 'pointer', color: filterValues[key] ? '#007bff' : '#888' }}
                    onClick={e => {
                      e.stopPropagation();
                      setOpenFilterKey(openFilterKey === key ? null : key);
                    }}
                    title="Filter column"
                  >
                    <FaFilter />
                  </span>
                  {openFilterKey === key && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        zIndex: 1000,
                        background: 'white',
                        border: '1px solid #ccc',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        padding: 12,
                        minWidth: 180,
                        marginTop: 4,
                        borderRadius: 6,
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <strong>Filter</strong>
                        <span style={{ cursor: 'pointer', color: '#888' }} onClick={() => setOpenFilterKey(null)}><FaTimes /></span>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <select
                          value={filterTypes[key]}
                          onChange={e => handleFilterTypeChange(key, e.target.value as "search" | "checkbox")}
                          style={{ width: '100%', marginBottom: 6 }}
                        >
                          <option value="search">Search Filter</option>
                          <option value="checkbox">Checkbox Filter</option>
                        </select>
                        {filterTypes[key] === "search" ? (
                          <input
                            type="text"
                            value={typeof filterValues[key] === "string" ? filterValues[key] : ""}
                            onChange={e => handleFilterChange(key, e.target.value)}
                            placeholder={`Filter by ${col.header}`}
                            style={{ width: '100%', padding: '5px' }}
                          />
                        ) : (
                          <div style={{ maxHeight: 150, overflowY: 'auto', border: '1px solid #eee', padding: 4 }}>
                            {filterOptions[key]?.map(option => (
                              <div key={option} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <input
                                  type="checkbox"
                                  checked={Array.isArray(filterValues[key]) && filterValues[key].includes(option)}
                                  onChange={e => {
                                    const currentValues = Array.isArray(filterValues[key]) ? filterValues[key] : [];
                                    const newValues = e.target.checked
                                      ? [...currentValues, option]
                                      : currentValues.filter(val => val !== option);
                                    handleFilterChange(key, newValues);
                                  }}
                                />
                                <label>{option}</label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button
                          onClick={() => handleFilterChange(key, filterTypes[key] === 'search' ? '' : [])}
                          style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, border: '1px solid #ccc', background: '#f8f8f8', cursor: 'pointer' }}
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => setOpenFilterKey(null)}
                          style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, border: '1px solid #007bff', background: '#007bff', color: 'white', cursor: 'pointer' }}
                        >
                          OK
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* Freeze icon */}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFrozen(col.accessor);
                }}
                style={{ cursor: "pointer" }}
              >
                {isFrozen ? <FaLock /> : <FaLockOpen />}
              </span>
              {/* Resize handle */}
              <span
                style={{
                  cursor: 'col-resize',
                  width: 8,
                  height: 24,
                  display: 'inline-block',
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  background: 'transparent',
                }}
                onMouseDown={(e) => handleResizeStart(e, key)}
                onClick={e => e.stopPropagation()}
                title="Resize column"
              />
            </div>
          </th>
        );
      })}
      {rowActions && <th style={{ minWidth: 80 }}>Actions</th>}
    </tr>
  );

  // Render table body for non-virtualized mode
  const renderTableBody = () => {
    if (loading) {
      // Show skeleton rows
      return Array.from({ length: rowsPerPage }).map((_, idx) => (
        <tr key={`skeleton-${idx}`}>
          {selectableRows && <td style={{ width: 40, minWidth: 40 }}><div className="skeleton-cell" /></td>}
          {updatedColumns.map((col, colIdx) => (
            <td key={colIdx}><div className="skeleton-cell" /></td>
          ))}
          {rowActions && <td style={{ minWidth: 80 }}><div className="skeleton-cell" /></td>}
        </tr>
      ));
    }
    if (groupedData) {
      return Object.entries(groupedData).map(([group, rows]) => (
        <React.Fragment key={group}>
          <tr>
            <td colSpan={updatedColumns.length + (selectableRows ? 1 : draggableRows ? 1 : 0) + (rowActions ? 1 : 0)}>
              <strong>{group}</strong>
            </td>
          </tr>
          {rows.map((row, index) => renderRow(index))}
        </React.Fragment>
      ));
    }
    return paginatedData.map((_, index) => renderRow(index));
  };

  return (
    <div className="smart-table-container">
      {tableTitle && <h3>{tableTitle}</h3>}
      {tableSubtitle && <h4>{tableSubtitle}</h4>}

      <div className="table-configurator" aria-label="Table Configurator">
        <div className="config-section">
          <div className="config-section-title"><FaLayerGroup style={{ marginRight: 6 }} /> Grouping</div>
          <div className="config-section-helper">Group your data by any column to reveal patterns and trends.</div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: 8 }}>
            <label htmlFor="group-by-selector" style={{ minWidth: 80 }}>Group By:</label>
            <select
              id="group-by-selector"
              value={groupBy || ""}
              onChange={(e) => setGroupBy(e.target.value || null)}
              aria-label="Group by column"
              style={{ padding: '6px 10px', borderRadius: 4, border: '1px solid var(--color-border)' }}
            >
              <option value="">None</option>
              {cachedColumns.map((col) => (
                <option key={String(col.accessor)} value={String(col.accessor)}>
                  {col.header}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="config-section">
          <div className="config-section-title"><FaLanguage style={{ marginRight: 6 }} /> Language</div>
          <div className="config-section-helper">Switch the table language for a global audience.</div>
          <div style={{ marginTop: 8 }}>{showLanguageSwitcher && <LanguageSwitcher />}</div>
        </div>
        <div className="config-section">
          <div className="config-section-title"><FaFilter style={{ marginRight: 6 }} /> Filters</div>
          <div className="config-section-helper">Narrow down your data with flexible, per-column filters.</div>
          <div style={{ marginTop: 8 }}>
            <span style={{ fontSize: 13, color: '#888' }}>Click the <FaFilter style={{ verticalAlign: 'middle' }} /> icon in any column header to filter that column.</span>
            <button onClick={clearFilters} className="clear-filter-button" style={{ marginLeft: 12 }} aria-label="Clear all filters">
              <FaBroom style={{ marginRight: 4 }} /> Clear All Filters
            </button>
          </div>
        </div>
        <div className="config-section">
          <div className="config-section-title"><FaColumns style={{ marginRight: 6 }} /> Columns</div>
          <div className="config-section-helper">Show or hide columns to focus on what matters most.</div>
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {cachedColumns.map((col) => (
              <label
                key={String(col.accessor)}
                htmlFor={`toggle-${String(col.accessor)}`}
                style={{ display: "flex", alignItems: "center", gap: "6px", background: columnVisibility[String(col.accessor)] ? 'var(--color-accent-light)' : 'transparent', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', border: '1px solid var(--color-border)' }}
              >
                <input
                  id={`toggle-${String(col.accessor)}`}
                  type="checkbox"
                  checked={columnVisibility[String(col.accessor)]}
                  onChange={() => toggleColumnVisibility(String(col.accessor))}
                  aria-label={`Toggle column ${col.header}`}
                />
                {col.header}
              </label>
            ))}
          </div>
        </div>
        <div className="config-section">
          <div className="config-section-title"><FaFileExport style={{ marginRight: 6 }} /> Export</div>
          <div className="config-section-helper">Export your current view for reporting or sharing.</div>
          <div style={{ marginTop: 8 }}>
            {allowExport && (
              <button onClick={handleExport} className="export-button" aria-label="Export table data">
                <FaFileExport style={{ marginRight: 4 }} /> Export as {exportFileType.toUpperCase()}
              </button>
            )}
          </div>
        </div>
        <div className="config-section">
          <div className="config-section-title"><FaBroom style={{ marginRight: 6 }} /> Reset</div>
          <div className="config-section-helper">Restore the table to its original state.</div>
          <div style={{ marginTop: 8 }}>
            <button onClick={clearHeaderCache} className="clear-cache-button" aria-label="Clear header cache">
              <FaBroom style={{ marginRight: 4 }} /> Clear Header Cache
            </button>
          </div>
        </div>
      </div>

      {filteredData.length === 0 && !loading ? (
        <div className="empty-state">
          <p>{t('table.noData')}</p>
        </div>
      ) : (
        <div className="smart-table-main"
          style={enableVirtualization ? { height: `${rowsPerPage * 20}px` } : {}}
        >
          {loading ? (
            <div className="table-loading-spinner" style={{ textAlign: 'center', padding: 40 }}>
              <div className="spinner" style={{ width: 40, height: 40, border: '4px solid #eee', borderTop: '4px solid #888', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
              <div style={{ marginTop: 12, color: '#888' }}>Loading...</div>
            </div>
          ) : enableVirtualization ? (
            draggableRows ? (
              <DndContext
                key={id}
                id={id}
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <TableVirtuoso
                  key={`virtuoso-${rowsPerPage}`}
                  style={{ width: '100%' }}
                  data={paginatedData}
                  totalCount={paginatedData.length}
                  initialItemCount={paginatedData.length}
                  fixedHeaderContent={renderHeader}
                  itemContent={(index) => renderRow(index)}
                  components={{
                    Table: ({ children, style }) => (
                      <table
                        className={`smart-table ${stickyHeader ? "sticky-header" : ""}`}
                        style={{ ...style, display: 'table', width: '100%' }}
                      >
                        {children}
                      </table>
                    ),
                    TableHead: ({ children, ...props }) => (
                      <thead {...(props as React.HTMLAttributes<HTMLTableSectionElement>)} style={{ display: 'table-header-group' }}>
                        {children}
                      </thead>
                    ),
                    TableBody: ({ children, ...props }) => (
                      <tbody {...(props as React.HTMLAttributes<HTMLTableSectionElement>)} style={{ display: 'table-row-group' }}>
                        <SortableContext
                          id={`sortable-rows-${id}`}
                          items={paginatedData.map((row) => row.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {children}
                        </SortableContext>
                      </tbody>
                    ),
                    TableRow: ({ children }) => children,
                  }}
                />
              </DndContext>
            ) : (
              <TableVirtuoso
                key={`virtuoso-${rowsPerPage}`}
                style={{ width: '100%' }}
                data={groupedData ? [] : paginatedData}
                totalCount={groupedData ? 0 : paginatedData.length}
                initialItemCount={groupedData ? 0 : paginatedData.length}
                fixedHeaderContent={renderHeader}
                itemContent={(index) => renderRow(index)}
                components={{
                  Table: ({ children, style }) => (
                    <table
                      className={`smart-table ${stickyHeader ? "sticky-header" : ""}`}
                      style={{ ...style, display: 'table', width: '100%' }}
                    >
                      {children}
                    </table>
                  ),
                  TableHead: ({ children, ...props }) => (
                    <thead {...(props as React.HTMLAttributes<HTMLTableSectionElement>)} style={{ display: 'table-header-group' }}>
                      {children}
                    </thead>
                  ),
                  TableBody: ({ children, ...props }) => (
                    <tbody {...(props as React.HTMLAttributes<HTMLTableSectionElement>)} style={{ display: 'table-row-group' }}>
                      {groupedData ? (
                        Object.entries(groupedData).map(([group, rows]) => (
                          <React.Fragment key={group}>
                            <tr>
                              <td colSpan={updatedColumns.length + (selectableRows ? 1 : 0) + (rowActions ? 1 : 0)}>
                                <strong>{group}</strong>
                              </td>
                            </tr>
                            {rows.map((row, index) => renderRow(index))}
                          </React.Fragment>
                        ))
                      ) : (
                        children
                      )}
                    </tbody>
                  ),
                  TableRow: ({ children }) => children,
                }}
              />
            )
          ) : (
            <DndContext
              key={id}
              id={id}
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <table className={`smart-table ${stickyHeader ? "sticky-header" : ""}`}>
                <thead style={{ display: 'table-header-group' }}>
                  {renderHeader()}
                </thead>
                <tbody style={{ display: 'table-row-group' }}>
                  <SortableContext
                    id={`sortable-rows-${id}`}
                    items={paginatedData.map((row) => row.id)}
                    strategy={verticalListSortingStrategy}
                    disabled={!draggableRows}
                  >
                    {renderTableBody()}
                  </SortableContext>
                </tbody>
              </table>
            </DndContext>
          )}
        </div>
      )}
      <div className="smart-table-pagination">
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
        >
          ⏮ First
        </button>
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          ◀ Prev
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Next ▶
        </button>
        <button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        >
          Last ⏭
        </button>
        <div style={{ marginLeft: 16 }}>
          <label htmlFor="page-selector">Current page:</label>
          <select id="page-selector" value={currentPage} onChange={handlePageChange}>
            {Array.from({ length: Math.ceil(filteredData.length / rowsPerPage) }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginLeft: 16 }}>
          <label htmlFor="rows-per-page-selector">Rows per page:</label>
          <select id="rows-per-page-selector" value={rowsPerPage} onChange={handleRowsPerPageChange}>
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginLeft: 16 }}>
          {filteredData.length > 0 && (
            <span style={{ fontSize: 13, color: '#555' }}>
              Showing {((currentPage - 1) * rowsPerPage) + 1}
              -{Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length}
            </span>
          )}
        </div>
      </div>
      {enableChatWithTable && (
        <ChatBox
          data={filteredData}
          aiProvider={aiProvider}
          apiKey={aiProvider === "openai" ? { openaiApiKey } : { geminiApiKey }}
          onChat={onChat}
        />
      )}
    </div>
  );
}