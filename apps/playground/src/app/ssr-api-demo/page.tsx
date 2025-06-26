'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { SmartTable } from "prakhar-smart-table";
import type { Column } from "prakhar-smart-table";
import "prakhar-smart-table/dist/index.css";


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

const columns: Column<Person>[] = [
  { header: "ID", accessor: "id", sortable: true, frozen: true, visible: true },
  { header: "Name", accessor: "name", sortable: true, frozen: true, visible: true },
  { header: "Age", accessor: "age", sortable: true },
  { header: "City", accessor: "city", frozen: true, sortable: false, filterable: true },
  { header: "Department", accessor: "department", filterable: true, filterKey: "department", sortable: true },
  { header: "Position", accessor: "position", sortable: true },
  { header: "Start Date", accessor: "startDate", sortable: true, frozen: true },
  { header: "Salary", accessor: "salary", sortable: true, frozen: true },
];

// Fetch from a real API and map to Person type
async function fetchPeopleFromAPI(params: {
  page: number;
  pageSize: number;
  sort?: { key: string; direction: 'asc' | 'desc' } | null;
  filters?: Record<string, any>;
}): Promise<{ data: Person[]; total: number }> {
  const { page, pageSize, sort, filters } = params;
  // For demo, use jsonplaceholder and map to Person
  const res = await fetch('https://jsonplaceholder.typicode.com/users');
  const users = await res.json();
  console.log("Fetched users:", users);
  // Map to Person type (mock fields)
  let people: Person[] = users.map((u: any, i: number) => ({
    id: String(u.id),
    name: u.name,
    age: 20 + (i % 15),
    city: u.address.city,
    department: ["Engineering", "Marketing", "Sales", "HR", "Finance", "Design"][i % 6],
    position: ["Developer", "Manager", "Executive", "Intern", "Lead Dev", "UI/UX"][i % 6],
    startDate: "2021-01-01",
    salary: `$${50000 + (i * 3000)}`,
  }));
  // Apply filters
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value === 'string' && value.trim()) {
        people = people.filter(row =>
          String((row as any)[key]).toLowerCase().includes(value.toLowerCase())
        );
      }
    });
  }
  // Apply sorting
  if (sort && sort.key) {
    people.sort((a, b) => {
      const aVal = (a as any)[sort.key];
      const bVal = (b as any)[sort.key];
      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }
  // Pagination
  const total = people.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const data = people.slice(start, end);
  await new Promise((res) => setTimeout(res, 600));
  return { data, total };
}

export default function SSRAPIDemo() {
  return (
    <div style={{ padding: "2rem" }}>
      <h2>SSR Table Demo (Real API)</h2>
      <p>This table fetches data from a real API endpoint and maps it to the table format.</p>
      <SmartTable
        data={[]}
        columns={columns}
        pageSize={5}
        currentPage={1}
        serverSide={true}
        fetchData={fetchPeopleFromAPI}
        tableTitle="User Directory (SSR API)"
        tableSubtitle="Server-side data from a real API, with pagination, sorting, and filtering"
        selectableRows={true}
        stickyHeader={true}
        allowExport={true}
        exportFileName="user-directory"
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