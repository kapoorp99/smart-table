export function getSortedData<T>(
    data: T[],
    sortConfig: { key: keyof T; direction: "asc" | "desc" } | null
  ): T[] {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }
  
  export function getPaginatedData<T>(data: T[], currentPage: number, pageSize: number): T[] {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }
  