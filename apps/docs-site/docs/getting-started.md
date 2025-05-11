---
sidebar_position: 1
---

# Getting Started

Smart Table is a lightweight and customizable JavaScript library for creating dynamic, interactive, and responsive tables. It simplifies the process of managing and displaying tabular data in web applications.

## Installation

Install via npm:

```bash
npm install smart-table
```

Or include it directly in your HTML:

```html
<script src="smart-table.min.js"></script>
```

## Basic Usage

Here's a simple example to get you started:

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

Add this HTML to your page:

```html
<div id="table-container"></div>
```

## Features

- **Sorting**: Easily sort table columns
- **Filtering**: Add filters to refine data
- **Pagination**: Handle large datasets with built-in pagination
- **Customizable**: Fully customizable styles and behaviors
- **Lightweight**: Minimal dependencies for fast performance 