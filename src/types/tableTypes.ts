/**
 * Represents a column in a table.
 *
 * @template T - The type of the data object for the table row.
 *
 * @property header - The display name of the column header.
 * @property accessor - The key of the data object that this column accesses.
 * @property render - An optional function to customize how the cell value is rendered.
 * @property sortable - An optional flag indicating if the column is sortable.
 * @property frozen - An optional flag indicating if the column is frozen (e.g., sticky).
 * @property searchable - An optional flag indicating if the column is searchable.
 * @property filterKey - An optional key used for filtering data in this column.
 *                        This can be useful when the filtering logic needs to
 *                        reference a specific property of the data object that
 *                        may differ from the `accessor`.
 */
export type Column<T> = {
  header: string;
  accessor: keyof T;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  frozen?: boolean;
  searchable?: boolean;
  filterKey?: string;
};

export type TableProps<T> = {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  currentPage?: number; // The current page number for paginated tables.
};
