import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "../styles/table.css";

export function SortableRow<T>({
  row,
  columns,
  frozenCols,
  selectable = false,
  isSelected = false,
  onSelect,
  style,
}: {
  row: T;
  columns: any[];
  frozenCols: Set<keyof T>;
  selectable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  style: React.CSSProperties;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: (row as any).id,
  });

  // const style = {
  //   transform: CSS.Transform.toString(transform),
  //   transition,
  // };

  return (
    <tr ref={setNodeRef} style={{
      ...style,
      transform: CSS.Transform.toString(transform),
      transition,
      cursor: "grab",
      backgroundColor: isSelected ? "#f0f0f0" : "white",
    }}>
      {selectable && (
        <td>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect?.();
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </td>
      )}
      <td {...attributes} {...listeners} style={{ cursor: "grab" }}>
        ⠿
      </td>
      {columns.map((col, index) => {
        const isFrozen = frozenCols.has(col.accessor);
        return (
          <td
            key={String(col.accessor)}
            className={isFrozen ? "freeze" : ""}
            style={{
              left: isFrozen ? `${index * 120}px` : undefined,
              zIndex: isFrozen ? 2 : 0,
            }}
          >
            {col.render
              ? col.render(row[col.accessor], row)
              : String(row[col.accessor])}
          </td>
        );
      })}
    </tr>
  );
}