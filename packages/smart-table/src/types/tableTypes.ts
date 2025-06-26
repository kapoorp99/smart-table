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
 * @property visible - An optional flag indicating if the column is visible or hidden. 
*/
export type Column<T> = {
  header: string;
  accessor?: keyof T;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  frozen?: boolean;
  searchable?: boolean;
  filterKey?: string;
  visible?: boolean; // Indicates if the column is visible or hidden
  filterable?: boolean; // Indicates if the column is filterable
  isActionColumn?: boolean; // Indicates if the column is an action column
};

export type TableProps<T> = {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  currentPage?: number; // The current page number for paginated tables.
  tableTitle?: string; // Optional title for the table.
  tableSubtitle?: string; // Optional subtitle for the table.
  draggableRows?: boolean; // Optional flag to enable row drag-and-drop
  selectableRows?: boolean;
  onRowSelectChange?: (selectedRows: T[]) => void;
  stickyHeader?: boolean; // Optional flag to enable sticky header
  allowExport?: boolean; // Optional flag to enable export functionality
  exportFileName?: string; // Optional file name for the exported file
  exportFileType?: 'csv' | 'xlsx'; // Optional file type for the exported file
  enableChatWithTable?: boolean; // Optional flag to enable chat with table data
  openaiApiKey?: string; // OpenAI API key for chat functionality
  geminiApiKey?: string; // Gemini API key for chat functionality
  aiProvider: "gemini" | "openai"; // AI provider for chat functionality
  onChat?: (data: T[], query: string) => Promise<string>; // Optional function for custom chat logic
  showLanguageSwitcher?: boolean; // Optional flag to show language switcher
  language: string; // Optional language for the table
  enableVirtualization: boolean; // Optional flag to enable virtualization for large datasets
  cacheKey?: string; // Optional cache key for caching data
  loading?: boolean; // Optional loading state
  rowActions?: (row: T) => React.ReactNode; // Optional function to render row actions
  /**
   * If true, the table will fetch data from the server using fetchData instead of using the static data prop.
   */
  serverSide?: boolean;
  /**
   * Function to fetch data from the server. Receives pagination, sorting, and filter params.
   * Should return a Promise with { data, total }.
   */
  fetchData?: (params: {
    page: number;
    pageSize: number;
    sort?: { key: string; direction: 'asc' | 'desc' } | null;
    filters?: Record<string, any>;
  }) => Promise<{ data: T[]; total: number; }>;
};
