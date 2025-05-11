# Smart Table

Smart Table is a lightweight and customizable JavaScript library for creating dynamic, interactive, and responsive tables. It simplifies the process of managing and displaying tabular data in web applications.

## Features

- **Sorting**: Easily sort table columns.
- **Filtering**: Add filters to refine data.
- **Pagination**: Handle large datasets with built-in pagination.
- **Customizable**: Fully customizable styles and behaviors.
- **Lightweight**: Minimal dependencies for fast performance.

## Installation

Install via npm:

```bash
npm install smart-table
```

## Usage

### Basic Example

```javascript
import SmartTable from 'smart-table';

const data = [
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 30 },
    { name: 'Charlie', age: 35 },
];

const table = new SmartTable('#table-container', {
    data: data,
    columns: [
        { key: 'name', label: 'Name' },
        { key: 'age', label: 'Age' },
    ],
});
```

### HTML

```html
<div id="table-container"></div>
```

## API

### Options

- `data`: Array of objects representing the table data.
- `columns`: Array of column definitions with `key` and `label`.
- `sortable`: Enable/disable sorting (default: `true`).
- `filterable`: Enable/disable filtering (default: `true`).
- `pagination`: Enable/disable pagination (default: `true`).

### Methods

- `updateData(newData)`: Update the table with new data.
- `refresh()`: Re-render the table.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License.

## Acknowledgments

Thanks to the open-source community for inspiration and support.