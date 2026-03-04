import type { CellState, TraceStep } from "../types";

interface Props {
  cell: CellState | undefined;
  onShowTrace: (trace: TraceStep[]) => void;
}

export function CellRenderer({ cell, onShowTrace }: Props) {
  if (!cell || cell.status === "idle") return null;

  if (cell.status === "loading") {
    return <span style={{ color: "#888" }}>&#8987;</span>;
  }

  if (cell.status === "error") {
    return <span title={cell.error} style={{ color: "#dc2626", cursor: "help" }}>Error</span>;
  }

  const hasTrace = cell.trace && cell.trace.length > 0;

  return (
    <span
      onClick={hasTrace ? () => onShowTrace(cell.trace!) : undefined}
      style={{
        cursor: hasTrace ? "pointer" : "default",
        borderBottom: hasTrace ? "1px dashed #2563eb" : "none",
        color: hasTrace ? "#1e40af" : "inherit",
      }}
    >
      {String(cell.value ?? "")}
    </span>
  );
}
