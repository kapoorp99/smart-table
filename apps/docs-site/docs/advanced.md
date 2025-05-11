---
sidebar_position: 3
---

# Advanced Features

## Virtualization

Smart Table supports virtual scrolling for handling large datasets efficiently. Enable it with the `enableVirtualization` prop:

```typescript
<SmartTable
  data={largeDataset}
  enableVirtualization={true}
/>
```

## AI-Powered Chat

Interact with your table data using natural language:

```typescript
<SmartTable
  enableChatWithTable={true}
  aiProvider="gemini"
  geminiApiKey="your-api-key"
/>
```

Example queries:
- "Show me all employees in the Engineering department"
- "What's the average salary by department?"
- "List employees who joined after 2020"

## Custom Cell Rendering

Customize how cells are displayed using the `render` prop:

```typescript
const columns = [
  {
    header: 'Status',
    accessor: 'status',
    render: (value, row) => (
      <span style={{ 
        color: value === 'active' ? 'green' : 'red' 
      }}>
        {value}
      </span>
    )
  }
];
```

## Frozen Columns

Keep important columns visible while scrolling horizontally:

```typescript
const columns = [
  {
    header: 'Name',
    accessor: 'name',
    frozen: true
  }
];
```

## Export Options

Export your table data in various formats:

```typescript
<SmartTable
  allowExport={true}
  exportFileName="my-data"
  exportFileType="xlsx"
/>
```

## Internationalization

Support multiple languages:

```typescript
<SmartTable
  showLanguageSwitcher={true}
  language="en"
/>
```

Available languages:
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Chinese (zh)
- Japanese (ja) 