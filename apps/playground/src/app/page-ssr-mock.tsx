import React from "react";
import { SmartTable } from "prakhar-smart-table";
import type { Column } from "prakhar-smart-table";
import "prakhar-smart-table/dist/index.css";

// ... Person type and columns definition (reuse from main page) ...
type Person = {
  id: string;
  name: string;
  age: number;
  city: string;
  department: string;
  position: string;
  startDate: string;
  salary: string;
};

const peopleData: Person[] = [
  // ... (copy your peopleData array here) ...
];

const columns: Column<Person>[] = [
  // ... (copy your columns array here) ...
];

// Simulate server-side data fetching
async function fetchPeopleData({ page, pageSize, sort, filters }) {
  await new Promise((res) => setTimeout(res, 600));
  let filtered = [...peopleData];
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value === 'string' && value.trim()) {
        filtered = filtered.filter(row =>
          String(row[key]).toLowerCase().includes(value.toLowerCase())
        );
      }
    });
  }
  if (sort && sort.key) {
    filtered.sort((a, b) => {
      const aVal = a[sort.key];
      const bVal = b[sort.key];
      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const data = filtered.slice(start, end);
  return { data, total };
}

export default function SSRMockDemo() {
  return (
    <div style={{ padding: "2rem" }}>
      <h2>SSR Table Demo (Mock Data)</h2>
      <p>This table fetches data from a mock server function, simulating real SSR/API behavior.</p>
      <SmartTable
        data={[]}
        columns={columns}
        pageSize={10}
        currentPage={1}
        serverSide={true}
        fetchData={fetchPeopleData}
        tableTitle="Employee Directory (SSR Mock)"
        tableSubtitle="Server-side data, pagination, sorting, and filtering"
        selectableRows={true}
        stickyHeader={true}
        allowExport={true}
        exportFileName="employee-directory"
        exportFileType="xlsx"
        enableChatWithTable={true}
        aiProvider="gemini"
        geminiApiKey={process.env.NEXT_PUBLIC_GEMINI_API_KEY}
        showLanguageSwitcher={true}
        language="en"
        enableVirtualization={false}
      />
    </div>
  );
} 