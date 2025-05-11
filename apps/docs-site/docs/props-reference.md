---
sidebar_position: 2
---

# Props Reference

## Core Props

| Prop         | Type                | Default | Required | Description |
|--------------|---------------------|---------|----------|-------------|
| `columns`    | `SmartTableColumn[]`| -       | Yes      | Column configuration array |
| `data`       | `any[]`            | -       | Yes      | Raw row data |

## Pagination & Sorting

| Prop              | Type      | Default | Description |
|-------------------|-----------|---------|-------------|
| `pageSize`        | `number`  | 10      | Number of rows per page |
| `sortable`        | `boolean` | true    | Enable column sorting |
| `enablePagination`| `boolean` | true    | Show pagination controls |

## Search & Filtering

| Prop                 | Type      | Default | Description |
|----------------------|-----------|---------|-------------|
| `enableGlobalSearch` | `boolean` | false   | Show global search input |
| `enableColumnFilter` | `boolean` | false   | Enable column-specific filters |

## Drag & Drop

| Prop              | Type      | Default | Description |
|-------------------|-----------|---------|-------------|
| `draggableRows`   | `boolean` | false   | Enable row drag-and-drop |
| `draggableColumns`| `boolean` | false   | Enable column reordering |

## Selection & Export

| Prop              | Type                        | Default | Description |
|-------------------|-----------------------------|---------|-------------|
| `selectableRows`  | `boolean`                   | false   | Enable row selection |
| `onRowSelectChange`| `(selectedRows: any[]) => void` | -    | Selection change callback |
| `enableExport`    | `boolean`                   | false   | Enable data export |

## Column Configuration

| Prop            | Type       | Default | Description |
|-----------------|------------|---------|-------------|
| `frozenColumns` | `string[]` | []      | Column keys to freeze |

## AI & Chat Features

| Prop              | Type                        | Default | Description |
|-------------------|-----------------------------|---------|-------------|
| `enableChatWithTable` | `boolean`              | false   | Show chat interface |
| `chatWithTable`   | `(data: any[]) => Promise<string>` | - | AI interaction callback |

## Advanced Features

| Prop         | Type      | Default | Description |
|--------------|-----------|---------|-------------|
| `enablePivot`| `boolean` | false   | Enable pivot table view |
| `virtualized`| `boolean` | false   | Enable virtual scrolling |
| `height`     | `number`  | -       | Required for virtualization |

## Usage Examples

### Basic Table
```typescript
<SmartTable
  columns={columns}
  data={data}
  pageSize={10}
/>
```

### With Selection & Export
```typescript
<SmartTable
  columns={columns}
  data={data}
  selectableRows={true}
  enableExport={true}
  onRowSelectChange={(selected) => console.log(selected)}
/>
```

### With Virtualization
```typescript
<SmartTable
  columns={columns}
  data={largeDataset}
  virtualized={true}
  height={500}
/>
```

### With AI Chat
```typescript
<SmartTable
  columns={columns}
  data={data}
  enableChatWithTable={true}
  chatWithTable={async (data) => {
    // AI processing logic
    return "Analysis result";
  }}
/>
```

### With Drag & Drop
```typescript
<SmartTable
  columns={columns}
  data={data}
  draggableRows={true}
  draggableColumns={true}
/>
```

### With Frozen Columns
```typescript
<SmartTable
  columns={columns}
  data={data}
  frozenColumns={['id', 'name']}
/>
```

## Type Definitions

### SmartTableColumn
```typescript
type SmartTableColumn = {
  key: string;
  header: string;
  accessor: string | ((row: any) => any);
  sortable?: boolean;
  filterable?: boolean;
  frozen?: boolean;
  width?: number | string;
  render?: (value: any, row: any) => React.ReactNode;
};
```

## Best Practices

1. **Performance**
   - Use `virtualized` for large datasets (>1000 rows)
   - Set appropriate `pageSize` based on data volume
   - Memoize column definitions

2. **Selection**
   - Implement `onRowSelectChange` for bulk actions
   - Use `selectableRows` with caution for large datasets

3. **Export**
   - Enable `enableExport` only when needed
   - Consider data size before export

4. **Virtualization**
   - Always provide `height` when using `virtualized`
   - Ensure proper container sizing

5. **AI Features**
   - Implement proper error handling in `chatWithTable`
   - Consider rate limiting and API costs

## Common Patterns

### 1. Dynamic Columns
```typescript
const [visibleColumns, setVisibleColumns] = useState(['name', 'age']);

const columns = [
  { key: 'name', header: 'Name', accessor: 'name', visible: visibleColumns.includes('name') },
  { key: 'age', header: 'Age', accessor: 'age', visible: visibleColumns.includes('age') }
];
```

### 2. Custom Export
```typescript
<SmartTable
  columns={columns}
  data={data}
  enableExport={true}
  onExport={(data) => {
    // Custom export logic
    return formatDataForExport(data);
  }}
/>
```

### 3. Advanced Filtering
```typescript
<SmartTable
  columns={columns}
  data={data}
  enableColumnFilter={true}
  onFilter={(filters) => {
    // Custom filter logic
    return applyFilters(data, filters);
  }}
/>
```

Would you like me to add more examples or expand on any particular prop's usage? 