import { useReducer, useCallback } from "react";
import type { ExtractionState, ExtractionAction } from "../types";
import { generateSchema } from "../api/schema-gen";
import { streamCollectionQuery } from "../api/extraction";

const initialState: ExtractionState = { columns: [], cells: {} };

function reducer(state: ExtractionState, action: ExtractionAction): ExtractionState {
  switch (action.type) {
    case "ADD_COLUMN":
      return {
        ...state,
        columns: [
          ...state.columns,
          {
            id: action.id,
            description: action.description,
            fieldName: "",
            fieldType: "string",
            status: "generating",
          },
        ],
      };
    case "COLUMN_SCHEMA_READY":
      return {
        ...state,
        columns: state.columns.map((c) =>
          c.id === action.id
            ? { ...c, fieldName: action.fieldName, fieldType: action.fieldType, status: "ready" as const }
            : c
        ),
      };
    case "COLUMN_ERROR":
      return {
        ...state,
        columns: state.columns.map((c) =>
          c.id === action.id ? { ...c, status: "error" as const, error: action.error } : c
        ),
      };
    case "CELL_LOADING":
      return {
        ...state,
        cells: {
          ...state.cells,
          [`${action.docId}::${action.columnId}`]: { status: "loading" },
        },
      };
    case "CELL_DONE":
      return {
        ...state,
        cells: {
          ...state.cells,
          [`${action.docId}::${action.columnId}`]: { status: "done", value: action.value, trace: action.trace },
        },
      };
    case "CELL_ERROR":
      return {
        ...state,
        cells: {
          ...state.cells,
          [`${action.docId}::${action.columnId}`]: { status: "error", error: action.error },
        },
      };
  }
}

export function useExtractionStore() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addColumn = useCallback(
    async (
      description: string,
      collectionId: string,
      docIds: string[],
      openrouterKey: string,
      okraKey: string
    ) => {
      const columnId = crypto.randomUUID();
      dispatch({ type: "ADD_COLUMN", id: columnId, description });

      try {
        const { fieldName, fieldType } = await generateSchema(description, openrouterKey);
        dispatch({ type: "COLUMN_SCHEMA_READY", id: columnId, fieldName, fieldType });

        // Mark all cells loading
        for (const docId of docIds) {
          dispatch({ type: "CELL_LOADING", docId, columnId });
        }

        // Single server-side fan-out via NDJSON stream
        await streamCollectionQuery(
          collectionId,
          description,
          fieldName,
          fieldType,
          okraKey,
          (event) => {
            if (event.type === "result" && event.doc_id) {
              if (event.status === "fulfilled") {
                // answer is JSON string from structured output
                let value: unknown = event.answer ?? "";
                try {
                  const parsed = JSON.parse(event.answer ?? "");
                  value = parsed[fieldName] ?? parsed;
                } catch {
                  // use raw answer
                }
                dispatch({ type: "CELL_DONE", docId: event.doc_id, columnId, value, trace: event.trace });
              } else {
                dispatch({
                  type: "CELL_ERROR",
                  docId: event.doc_id,
                  columnId,
                  error: event.error ?? "Extraction failed",
                });
              }
            }
          },
        );
      } catch (err) {
        dispatch({
          type: "COLUMN_ERROR",
          id: columnId,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    },
    []
  );

  return { state, addColumn };
}
