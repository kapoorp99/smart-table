---
sidebar_position: 2
---

# API Reference

## SmartTable Props

### data
Type: `Array<T>`
Required: `true`

Array of objects representing the table data. Each object should match the type specified in the generic parameter.

```typescript
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

const data: Person[] = [...];
```

### columns
Type: `Array<Column<T>>`
Required: `true`

Array of column definitions. Each column should have the following properties:

```typescript
type Column<T> = {
  header: string;           // Display name for the column header
  accessor: keyof T;        // Property name in your data objects
  sortable?: boolean;       // Enable/disable sorting (default: true)
  filterable?: boolean;     // Enable/disable filtering (default: false)
  filterKey?: string;       // Custom key for filtering
  frozen?: boolean;         // Freeze column to left/right side
  visible?: boolean;        // Show/hide column (default: true)
  width?: number | string;  // Column width
  render?: (value: any, row: T) => React.ReactNode; // Custom cell renderer
};
```

### pageSize
Type: `number`
Default: `10`

Number of rows to display per page.

### currentPage
Type: `number`
Default: `1`

Current active page number.

### tableTitle
Type: `string`
Optional

Title displayed above the table.

### tableSubtitle
Type: `string`
Optional

Subtitle displayed below the table title.

### selectableRows
Type: `boolean`
Default: `false`

Enable row selection functionality.

### stickyHeader
Type: `boolean`
Default: `false`

Make the table header stick to the top while scrolling.

### draggableRows
Type: `boolean`
Default: `false`

Enable row drag and drop functionality.

### allowExport
Type: `boolean`
Default: `false`

Enable data export functionality.

### exportFileName
Type: `string`
Default: `'table-export'`

Name of the exported file.

### exportFileType
Type: `'csv' | 'xlsx'`
Default: `'csv'`

Format of the exported file.

### enableChatWithTable
Type: `boolean`
Default: `false`

Enable AI-powered chat functionality with the table data.

### aiProvider
Type: `'gemini' | 'openai'`
Default: `'gemini'`

AI service provider for chat functionality.

### geminiApiKey
Type: `string`
Optional

API key for Gemini AI service.

### showLanguageSwitcher
Type: `boolean`
Default: `false`

Enable language switching functionality.

### language
Type: `string`
Default: `'en'`

Current language of the table.

### enableVirtualization
Type: `boolean`
Default: `false`

Enable virtual scrolling for better performance with large datasets.

## Methods

### updateData(newData: T[])
Updates the table with new data.

```typescript
table.updateData([
    { name: 'David', age: 28 },
    { name: 'Eve', age: 32 }
]);
```

### refresh()
Re-renders the table with current data and settings.

```typescript
table.refresh();
```

### exportData()
Exports the current table data to the specified format.

```typescript
table.exportData();
```

### setLanguage(lang: string)
Changes the table language.

```typescript
table.setLanguage('es');
```

## Events

### onRowSelectChange
Type: `(selectedRows: T[]) => void`

Callback fired when row selection changes.

```typescript
<SmartTable
  onRowSelectChange={(selectedRows) => {
    console.log('Selected rows:', selectedRows);
  }}
/>
```

### onSort
Type: `(column: string, direction: 'asc' | 'desc') => void`

Callback fired when column sorting changes.

```typescript
<SmartTable
  onSort={(column, direction) => {
    console.log(`Sorting ${column} in ${direction} order`);
  }}
/>
```

### onFilter
Type: `(filters: Record<string, any>) => void`

Callback fired when filters are applied.

```typescript
<SmartTable
  onFilter={(filters) => {
    console.log('Applied filters:', filters);
  }}
/>
``` 