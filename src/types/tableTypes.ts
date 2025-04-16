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
};
