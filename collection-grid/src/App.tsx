import { useState, useEffect, useCallback } from "react";
import { fetchCollection } from "./api/collections";
import type { Collection } from "./types";
import { useExtractionStore } from "./hooks/useExtractionStore";
import { SettingsPanel } from "./components/SettingsPanel";
import { GridView } from "./components/GridView";
import { AddColumnDialog } from "./components/AddColumnDialog";

const DEFAULT_COLLECTION_ID = import.meta.env.VITE_COLLECTION_ID ?? "col-1f2b793609f042e882ba1c0f8598f902";

export default function App() {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [keys, setKeys] = useState<{ okra: string; openrouter: string } | null>(() => {
    const okra = localStorage.getItem("okra_api_key") ?? "";
    const openrouter = localStorage.getItem("openrouter_api_key") ?? "";
    return okra && openrouter ? { okra, openrouter } : null;
  });
  const { state: extraction, addColumn } = useExtractionStore();

  useEffect(() => {
    fetchCollection(DEFAULT_COLLECTION_ID)
      .then(setCollection)
      .catch((err) => setError(err.message));
  }, []);

  const handleAddColumn = useCallback(
    (description: string) => {
      if (!collection || !keys) return;
      const docIds = collection.documents.map((d) => d.id);
      addColumn(description, DEFAULT_COLLECTION_ID, docIds, keys.openrouter, keys.okra);
    },
    [collection, keys, addColumn]
  );

  if (error) {
    return <div style={{ padding: 32, color: "#dc2626" }}>Error: {error}</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <SettingsPanel onReady={(okra, openrouter) => setKeys({ okra, openrouter })} />
      <div style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>
          {collection ? collection.name : "Loading..."}
        </span>
        <span style={{ fontSize: 12, color: "#666" }}>
          {collection ? `${collection.documents.length} documents` : ""}
        </span>
        <div style={{ marginLeft: "auto" }}>
          <AddColumnDialog onAdd={handleAddColumn} disabled={!keys} />
        </div>
      </div>
      <div style={{ flex: 1, padding: "0 16px 16px" }}>
        {collection ? (
          <GridView documents={collection.documents} extraction={extraction} />
        ) : (
          <div style={{ padding: 32, color: "#888" }}>Loading collection...</div>
        )}
      </div>
    </div>
  );
}
