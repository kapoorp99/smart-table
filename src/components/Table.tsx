import React, { useId, useState, useMemo } from "react";
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
import "../styles/table.css";
import { FaLock, FaLockOpen, FaSort, FaArrowUp, FaArrowDown, FaFilter } from "react-icons/fa";
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
}: TableProps<T>) {
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
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filterTypes, setFilterTypes] = useState<Record<string, "search" | "checkbox">>(
    () => Object.fromEntries(columns.map((col) => [String(col.accessor), "search"]))
  );

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
    columns.forEach((col) => {
      if (col.filterable) {
        const uniqueValues = [...new Set(data.map((row) => String(row[col.accessor])))]
          .filter((value) => value !== "" && value !== null && value !== undefined)
          .sort();
        options[String(col.accessor)] = uniqueValues;
      }
    });
    return options;
  }, [data, columns]);

  // Filter data based on filterValues
  const filteredData = useMemo(() => {
    if (!Object.values(filterValues).some((val) => 
      (typeof val === "string" && val.trim() !== "") || (Array.isArray(val) && val.length > 0)
    )) return data;

    return data.filter((row) =>
      Object.entries(filterValues).every(([key, value]) => {
        const column = columns.find((col) => String(col.accessor) === key);
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
  }, [data, filterValues, columns]);

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
  }, [currentPageData, sortConfig, draggableRows]);

  const updatedColumns = React.useMemo(() => {
    return columns.filter((col) => columnVisibility[String(col.accessor)]).sort((a, b) => {
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

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const toggleColumnVisibility = (key: string) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortConfig(null);
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

  // Render row component
  const renderRow = (row: T, index: number) => {
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
        />
      );
    }

    return (
      <tr key={row.id} style={{ display: 'table-row' }}>
        {selectableRows && (
          <td>
            <input
              type="checkbox"
              checked={isRowSelected(row.id)}
              onChange={() => toggleRowSelection(row.id)}
            />
          </td>
        )}
        {updatedColumns.map((col, colIndex) => {
          const isFrozen = frozenCols.has(col.accessor);
          return (
            <td
              key={String(col.accessor)}
              className={isFrozen ? "freeze" : ""}
              style={{
                left: isFrozen ? `${colIndex * 120}px` : undefined,
                zIndex: isFrozen ? 2 : 0,
                position: isFrozen ? 'sticky' : undefined,
              }}
            >
              {col.render
                ? col.render(row[col.accessor], row)
                : String(row[col.accessor])}
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <div className="smart-table-container">
      {tableTitle && <h3>{tableTitle}</h3>}
      {tableSubtitle && <h4>{tableSubtitle}</h4>}

      <div className="table-configurator">
        <h4>Table Configurator</h4>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label htmlFor="group-by-selector">Group By:</label>
          <select
            id="group-by-selector"
            value={groupBy || ""}
            onChange={(e) => setGroupBy(e.target.value || null)}
          >
            <option value="">None</option>
            {columns.map((col) => (
              <option key={String(col.accessor)} value={String(col.accessor)}>
                {col.header}
              </option>
            ))}
          </select>
        </div>
        <div>
          {showLanguageSwitcher && <LanguageSwitcher />}
        </div>
        <div>
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
            className="filter-button"
          >
            <FaFilter /> {t('table.filters')}
          </button>
        </div>
        {showFilterPanel && (
          <div className="filter-panel" style={{ marginTop: "10px", padding: "10px", border: "1px solid #ccc" }}>
            <h5>Filters</h5>
            {columns
              .filter((col) => col.filterable)
              .map((col) => {
                const key = String(col.accessor);
                const filterType = filterTypes[key];
                return (
                  <div key={key} style={{ marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
                      <label htmlFor={`filter-type-${key}`}>{col.header}</label>
                      <select
                        id={`filter-type-${key}`}
                        value={filterType}
                        onChange={(e) => handleFilterTypeChange(key, e.target.value as "search" | "checkbox")}
                      >
                        <option value="search">Search Filter</option>
                        <option value="checkbox">Checkbox Filter</option>
                      </select>
                    </div>
                    {filterType === "search" ? (
                      <input
                        id={`filter-${key}`}
                        type="text"
                        value={typeof filterValues[key] === "string" ? filterValues[key] : ""}
                        onChange={(e) => handleFilterChange(key, e.target.value)}
                        placeholder={`Filter by ${col.header}`}
                        style={{ marginLeft: "10px", padding: "5px", width: "100%" }}
                      />
                    ) : (
                      <div style={{ maxHeight: "150px", overflowY: "auto", border: "1px solid #ddd", padding: "5px" }}>
                        {filterOptions[key]?.map((option) => (
                          <div key={option} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <input
                              type="checkbox"
                              id={`checkbox-${key}-${option}`}
                              checked={Array.isArray(filterValues[key]) && filterValues[key].includes(option)}
                              onChange={(e) => {
                                const currentValues = Array.isArray(filterValues[key]) ? filterValues[key] : [];
                                const newValues = e.target.checked
                                  ? [...currentValues, option]
                                  : currentValues.filter((val) => val !== option);
                                handleFilterChange(key, newValues);
                              }}
                            />
                            <label htmlFor={`checkbox-${key}-${option}`}>{option}</label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            <button onClick={clearFilters} style={{ marginTop: "10px" }} className="clear-filter-button">
              {t('table.clearFilters')}
            </button>
          </div>
        )}
        {columns.map((col) => (
          <div key={String(col.accessor)}>
            <label
              htmlFor={`toggle-${String(col.accessor)}`}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <input
                id={`toggle-${String(col.accessor)}`}
                type="checkbox"
                checked={columnVisibility[String(col.accessor)]}
                onChange={() => toggleColumnVisibility(String(col.accessor))}
              />
              {col.header}
            </label>
          </div>
        ))}
        {allowExport && (
          <button onClick={handleExport} className="export-button">
            {t('table.export')} as {exportFileType.toUpperCase()}
          </button>
        )}
      </div>

      {filteredData.length === 0 ? (
        <div className="empty-state">
          <p>{t('table.noData')}</p>
        </div>
      ) : (
        <div className="smart-table-main">
          {draggableRows ? (
            <DndContext
              key={id}
              id={id}
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <table className={`smart-table ${stickyHeader ? "sticky-header" : ""}`} style={{ display: 'table', width: '100%' }}>
                <thead>
                  <tr>
                    {selectableRows && (
                      <th>
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
                    <th />
                    {updatedColumns.map((col, index) => {
                      const isFrozen = frozenCols.has(col.accessor);
                      return (
                        <th
                          key={String(col.accessor)}
                          onClick={(!draggableRows && col.sortable) ? () => requestSort(col.accessor) : undefined}
                          className={`${isFrozen ? "freeze" : ""} ${!draggableRows && col.sortable ? "sortable" : ""}`}
                          style={{
                            left: isFrozen ? `${index * 120}px` : undefined,
                            position: isFrozen ? 'sticky' : undefined,
                            zIndex: isFrozen ? 3 : 1,
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
                <tbody style={{ display: 'table-row-group' }}>
                  <SortableContext
                    id={`sortable-rows-${id}`}
                    items={paginatedData.map((row) => row.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {paginatedData.map((row, index) => renderRow(row, index))}
                  </SortableContext>
                </tbody>
              </table>
            </DndContext>
          ) : (
            <table className={`smart-table ${stickyHeader ? "sticky-header" : ""}`} style={{ display: 'table', width: '100%' }}>
              <thead>
                <tr>
                  {selectableRows && (
                    <th>
                      <input
                        type="checkbox"
                        onChange={toggleSelectAll}
                        checked={paginatedData.length > 0 && paginatedData.every((row) => selectedRowIds.has(row.id))}
                      />
                    </th>
                  )}
                  {updatedColumns.map((col, index) => {
                    const isFrozen = frozenCols.has(col.accessor);
                    return (
                      <th
                        key={String(col.accessor)}
                        onClick={(!draggableRows && col.sortable) ? () => requestSort(col.accessor) : undefined}
                        className={`${isFrozen ? "freeze" : ""} ${!draggableRows && col.sortable ? "sortable" : ""}`}
                        style={{
                          left: isFrozen ? `${index * 120}px` : undefined,
                          position: isFrozen ? 'sticky' : undefined,
                          zIndex: isFrozen ? 3 : 1,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {col.header}
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
              <tbody style={{ display: 'table-row-group' }}>
                {groupedData ? (
                  Object.entries(groupedData).map(([group, rows]) => (
                    <React.Fragment key={group}>
                      <tr>
                        <td colSpan={updatedColumns.length + (selectableRows ? 1 : 0)}>
                          <strong>{group}</strong>
                        </td>
                      </tr>
                      {rows.map((row, index) => (
                        <tr key={row.id}>
                          {selectableRows && (
                            <td>
                              <input
                                type="checkbox"
                                checked={isRowSelected(row.id)}
                                onChange={() => toggleRowSelection(row.id)}
                              />
                            </td>
                          )}
                          {updatedColumns.map((col, colIndex) => {
                            const isFrozen = frozenCols.has(col.accessor);
                            return (
                              <td
                                key={String(col.accessor)}
                                className={isFrozen ? "freeze" : ""}
                                style={{
                                  left: isFrozen ? `${colIndex * 120}px` : undefined,
                                  zIndex: isFrozen ? 2 : 0,
                                  position: isFrozen ? 'sticky' : undefined,
                                }}
                              >
                                {col.render
                                  ? col.render(row[col.accessor], row)
                                  : String(row[col.accessor])}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))
                ) : (
                  paginatedData.map((row, index) => renderRow(row, index))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
      <div className="smart-table-pagination">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
        <div>
          <label htmlFor="page-selector">Current page:</label>
          <select id="page-selector" value={currentPage} onChange={handlePageChange}>
            {Array.from({ length: Math.ceil(filteredData.length / rowsPerPage) }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="rows-per-page-selector">Rows per page:</label>
          <select id="rows-per-page-selector" value={rowsPerPage} onChange={handleRowsPerPageChange}>
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
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