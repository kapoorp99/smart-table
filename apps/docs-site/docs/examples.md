---
sidebar_position: 3
---

# Examples

## Quick Start

```typescript
import { SmartTable } from "smart-table";
import "smart-table/dist/index.css";

const data = [
  { name: "Alice", age: 25, department: "Engineering" },
  { name: "Bob", age: 30, department: "Marketing" }
];

const columns = [
  { header: "Name", accessor: "name", sortable: true },
  { header: "Age", accessor: "age", sortable: true },
  { header: "Department", accessor: "department", filterable: true }
];

<SmartTable
  data={data}
  columns={columns}
  pageSize={10}
/>
```

## Common Use Cases

### 1. Employee Directory
```typescript
<SmartTable<Person>
  data={employees}
  columns={[
    { header: "Name", accessor: "name", frozen: true },
    { header: "Department", accessor: "department", filterable: true },
    { header: "Salary", accessor: "salary", sortable: true }
  ]}
  selectableRows={true}
  allowExport={true}
  exportFileType="xlsx"
/>
```

### 2. Product Inventory
```typescript
<SmartTable<Product>
  data={products}
  columns={[
    { header: "SKU", accessor: "sku", frozen: true },
    { header: "Name", accessor: "name", sortable: true },
    { header: "Price", accessor: "price", sortable: true },
    { header: "Stock", accessor: "stock", filterable: true }
  ]}
  stickyHeader={true}
  enableVirtualization={true}
/>
```

### 3. Financial Transactions
```typescript
<SmartTable<Transaction>
  data={transactions}
  columns={[
    { header: "Date", accessor: "date", frozen: true },
    { header: "Amount", accessor: "amount", sortable: true },
    { header: "Category", accessor: "category", filterable: true }
  ]}
  enableChatWithTable={true}
  aiProvider="gemini"
/>
```

## Feature Examples

### Sorting
```typescript
const columns = [
  { header: "Name", accessor: "name", sortable: true },
  { header: "Age", accessor: "age", sortable: true }
];
```

### Filtering
```typescript
const columns = [
  { header: "Department", accessor: "department", filterable: true },
  { header: "Status", accessor: "status", filterable: true, filterKey: "status" }
];
```

### Frozen Columns
```typescript
const columns = [
  { header: "ID", accessor: "id", frozen: true },
  { header: "Name", accessor: "name", frozen: true },
  { header: "Details", accessor: "details" }
];
```

### Custom Cell Rendering
```typescript
const columns = [
  {
    header: "Status",
    accessor: "status",
    render: (value) => (
      <span style={{ color: value === 'active' ? 'green' : 'red' }}>
        {value}
      </span>
    )
  }
];
```

### Row Selection
```typescript
<SmartTable
  data={data}
  columns={columns}
  selectableRows={true}
  onRowSelectChange={(selected) => {
    console.log('Selected:', selected);
  }}
/>
```

### Data Export
```typescript
<SmartTable
  data={data}
  columns={columns}
  allowExport={true}
  exportFileName="report"
  exportFileType="xlsx"
/>
```

### Virtual Scrolling
```typescript
<SmartTable
  data={largeDataset}
  columns={columns}
  enableVirtualization={true}
  pageSize={50}
/>
```

### AI Chat Integration
```typescript
<SmartTable
  data={data}
  columns={columns}
  enableChatWithTable={true}
  aiProvider="gemini"
  geminiApiKey="your-key"
/>
```

## Advanced Examples

### Custom Styling
```typescript
<div style={{ 
  padding: "1rem",
  maxWidth: "1200px",
  margin: "0 auto",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)"
}}>
  <SmartTable
    data={data}
    columns={columns}
    stickyHeader={true}
  />
</div>
```

### Dynamic Columns
```typescript
const [visibleColumns, setVisibleColumns] = useState(['name', 'age']);

const columns = [
  { header: "Name", accessor: "name", visible: visibleColumns.includes('name') },
  { header: "Age", accessor: "age", visible: visibleColumns.includes('age') }
];
```

### Custom Filtering
```typescript
const columns = [
  {
    header: "Price Range",
    accessor: "price",
    filterable: true,
    filterKey: "priceRange",
    render: (value) => `$${value}`
  }
];
```

### Row Actions
```typescript
const columns = [
  { header: "Name", accessor: "name" },
  {
    header: "Actions",
    accessor: "actions",
    render: (_, row) => (
      <button onClick={() => handleEdit(row)}>Edit</button>
    )
  }
];
```

### Responsive Design
```typescript
<div style={{ 
  width: "100%",
  overflowX: "auto",
  "@media (max-width: 768px)": {
    fontSize: "14px"
  }
}}>
  <SmartTable
    data={data}
    columns={columns}
    stickyHeader={true}
  />
</div>
```

## Best Practices

1. **Performance**
   - Use virtualization for 1000+ rows
   - Implement pagination for large datasets
   - Memoize column definitions

2. **Accessibility**
   - Include proper ARIA labels
   - Ensure keyboard navigation
   - Maintain color contrast

3. **Data Handling**
   - Validate data before rendering
   - Implement error boundaries
   - Handle loading states

4. **Styling**
   - Use consistent spacing
   - Implement responsive design
   - Follow your design system

## Common Patterns

### 1. CRUD Operations
```typescript
<SmartTable
  data={items}
  columns={[
    { header: "Name", accessor: "name" },
    {
      header: "Actions",
      accessor: "actions",
      render: (_, row) => (
        <>
          <button onClick={() => handleEdit(row)}>Edit</button>
          <button onClick={() => handleDelete(row)}>Delete</button>
        </>
      )
    }
  ]}
/>
```

### 2. Data Filtering
```typescript
<SmartTable
  data={filteredData}
  columns={columns}
  onFilter={(filters) => {
    setFilteredData(applyFilters(data, filters));
  }}
/>
```

### 3. Export with Custom Format
```typescript
<SmartTable
  data={data}
  columns={columns}
  allowExport={true}
  exportFileName="custom-report"
  exportFileType="xlsx"
  onExport={(data) => {
    // Custom export logic
    return formatDataForExport(data);
  }}
/>
```

Would you like me to add more specific examples or focus on any particular use case? 