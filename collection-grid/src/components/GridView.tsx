import { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import type { CollectionDocument, ExtractionState, TraceStep } from "../types";
import { CellRenderer } from "./CellRenderer";
import { TraceModal } from "./TraceModal";

ModuleRegistry.registerModules([AllCommunityModule]);

interface Props {
  documents: CollectionDocument[];
  extraction: ExtractionState;
}

export function GridView({ documents, extraction }: Props) {
  const [activeTrace, setActiveTrace] = useState<TraceStep[] | null>(null);

  const columnDefs = useMemo<ColDef[]>(() => {
    const base: ColDef[] = [
      { field: "file_name", headerName: "File", flex: 2, minWidth: 200 },
      { field: "pages_total", headerName: "Pages", width: 80, type: "numericColumn" },
    ];

    const custom: ColDef[] = extraction.columns.map((col) => ({
      colId: col.id,
      headerName: col.status === "generating" ? `${col.description} ...` : col.status === "error" ? `${col.description} (err)` : col.description,
      flex: 1,
      minWidth: 140,
      cellRenderer: (params: ICellRendererParams) => {
        const docId = params.data?.id;
        if (!docId) return null;
        const cell = extraction.cells[`${docId}::${col.id}`];
        return <CellRenderer cell={cell} onShowTrace={setActiveTrace} />;
      },
    }));

    return [...base, ...custom];
  }, [extraction.columns, extraction.cells]);

  return (
    <div className="ag-theme-quartz" style={{ height: "100%", width: "100%" }}>
      <AgGridReact
        rowData={documents}
        columnDefs={columnDefs}
        getRowId={(params) => params.data.id}
        defaultColDef={{ sortable: true, resizable: true }}
        animateRows={false}
      />
      {activeTrace && (
        <TraceModal trace={activeTrace} onClose={() => setActiveTrace(null)} />
      )}
    </div>
  );
}
