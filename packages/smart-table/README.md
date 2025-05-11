# Smart Table

Smart Table is a feature-rich React component library for creating dynamic, interactive, and responsive tables. It simplifies the process of managing and displaying tabular data in web applications with TypeScript support.

## Features

- **Sorting**: Easily sort table columns.
- **Filtering**: Add filters to refine data.
- **Pagination**: Handle large datasets with built-in pagination.
- **Row Selection**: Select rows for batch operations.
- **Export**: Export table data to different formats.
- **AI Integration**: Chat with your table data using AI providers like Gemini.
- **Customizable**: Fully customizable styles and behaviors.
- **Internationalization**: Support for multiple languages.
- **Lightweight**: Minimal dependencies for fast performance.

## Installation

Install via npm:

```bash
npm install prakhar-smart-table
yarn add prakhar-smart-table



Don't forget to import the styles:

```javascript
import "prakhar-smart-table/dist/index.css";
```

## Usage

### Basic Example

```tsx
import React from "react";
import { SmartTable } from "prakhar-smart-table";
import type { Column } from "prakhar-smart-table";
import "prakhar-smart-table/dist/index.css";

type Person = {
  id: string;
  name: string;
  age: number;
  city: string;
};

const peopleData: Person[] = [
  { id: "1", name: "Alice", age: 24, city: "New York" },
  { id: "2", name: "Bob", age: 30, city: "Los Angeles" },
  { id: "3", name: "Charlie", age: 28, city: "Chicago" },
];

const columns: Column<Person>[] = [
  { header: "Name", accessor: "name", sortable: true },
  { header: "Age", accessor: "age", sortable: true },
  { header: "City", accessor: "city", filterable: true },
];

export default function App() {
  return (
    <div>
      <SmartTable<Person>
        data={peopleData}
        columns={columns}
        pageSize={10}
        tableTitle="People Directory"
      />
    </div>
  );
}
```

### Advanced Features

```tsx
<SmartTable<Person>
  data={peopleData}
  columns={columns}
  pageSize={10}
  currentPage={2}
  tableTitle="Employee Directory"
  tableSubtitle="List of employees in the company"
  selectableRows={true}
  stickyHeader={true}
  onRowSelectChange={(selectedRows) => {
    console.log("Selected rows:", selectedRows);
  }}
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
```

## API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | Array<T> | Required | Array of objects representing the table data |
| `columns` | Column<T>[] | Required | Array of column definitions |
| `pageSize` | number | 10 | Number of rows per page |
| `currentPage` | number | 1 | Initial page to display |
| `tableTitle` | string | undefined | Title displayed above the table |
| `tableSubtitle` | string | undefined | Subtitle displayed below the title |
| `selectableRows` | boolean | false | Enable row selection |
| `stickyHeader` | boolean | false | Keep header fixed while scrolling |
| `onRowSelectChange` | function | undefined | Callback when row selection changes |
| `allowExport` | boolean | false | Enable export functionality |
| `exportFileName` | string | "export" | Name of the exported file |
| `exportFileType` | string | "csv" | Type of export file (csv, xlsx) |
| `enableChatWithTable` | boolean | false | Enable AI chat functionality |
| `aiProvider` | string | undefined | AI provider to use (e.g., "gemini") |
| `geminiApiKey` | string | undefined | API key for Gemini AI provider |
| `showLanguageSwitcher` | boolean | false | Show language selection UI |
| `language` | string | "en" | Default language |
| `enableVirtualization` | boolean | false | Enable virtualized rendering for large datasets |
| `draggableRows` | boolean | false | Allow rows to be reordered via drag and drop |

### Column Properties

| Property | Type | Description |
|----------|------|-------------|
| `header` | string | Column header text |
| `accessor` | keyof T | Property name in data objects |
| `sortable` | boolean | Enable sorting for this column |
| `filterable` | boolean | Enable filtering for this column |
| `filterKey` | string | Key to use for filtering |
| `frozen` | boolean | Keep column visible during horizontal scroll |
| `visible` | boolean | Control column visibility |

## TypeScript Support

Smart Table is built with TypeScript and provides full type safety. The component is generic and can be typed with your data structure:

```tsx
// Define your data type
type User = {
  id: number;
  username: string;
  email: string;
};

// Use the generic type with SmartTable
<SmartTable<User> data={users} columns={userColumns} />
```

## Browser Support

Smart Table supports all modern browsers including:
- Chrome (and Chromium-based browsers)
- Firefox
- Safari
- Edge

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
