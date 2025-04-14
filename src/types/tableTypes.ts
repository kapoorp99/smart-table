export type Column<T> = {
  header: string;
  accessor: keyof T;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  frozen?: boolean;
};

export type TableProps<T> = {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
};
