export interface CollectionDocument {
  id: string;
  file_name: string;
  phase: string;
  pages_total: number;
  total_nodes: number;
  added_at: string;
}

export interface Collection {
  id: string;
  name: string;
  documents: CollectionDocument[];
}

export type FieldType = "string" | "number" | "integer" | "boolean";

export interface CustomColumn {
  id: string;
  description: string;
  fieldName: string;
  fieldType: FieldType;
  status: "generating" | "ready" | "error";
  error?: string;
}

export type CellStatus = "idle" | "loading" | "done" | "error";

export interface TraceStep {
  name: string;
  args: unknown;
  result: unknown;
}

export interface CellState {
  status: CellStatus;
  value?: unknown;
  error?: string;
  trace?: TraceStep[];
}

export type ExtractionAction =
  | { type: "ADD_COLUMN"; id: string; description: string }
  | { type: "COLUMN_SCHEMA_READY"; id: string; fieldName: string; fieldType: FieldType }
  | { type: "COLUMN_ERROR"; id: string; error: string }
  | { type: "CELL_LOADING"; docId: string; columnId: string }
  | { type: "CELL_DONE"; docId: string; columnId: string; value: unknown; trace?: TraceStep[] }
  | { type: "CELL_ERROR"; docId: string; columnId: string; error: string };

export interface ExtractionState {
  columns: CustomColumn[];
  cells: Record<string, CellState>; // key: `${docId}::${columnId}`
}
