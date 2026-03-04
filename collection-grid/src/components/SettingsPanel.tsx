import { useState, useEffect } from "react";

interface Props {
  onReady: (okraKey: string, openrouterKey: string) => void;
}

function load(key: string) {
  return localStorage.getItem(key) ?? "";
}

export function SettingsPanel({ onReady }: Props) {
  const [okraKey, setOkraKey] = useState(() => load("okra_api_key"));
  const [openrouterKey, setOpenrouterKey] = useState(() => load("openrouter_api_key"));

  useEffect(() => {
    localStorage.setItem("okra_api_key", okraKey);
  }, [okraKey]);

  useEffect(() => {
    localStorage.setItem("openrouter_api_key", openrouterKey);
  }, [openrouterKey]);

  const ready = okraKey.length > 0 && openrouterKey.length > 0;

  return (
    <div style={{ padding: 16, borderBottom: "1px solid #e0e0e0", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>OkraPDF Key</span>
        <input
          type="password"
          value={okraKey}
          onChange={(e) => setOkraKey(e.target.value)}
          placeholder="okra_..."
          style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #ccc", width: 200, fontFamily: "monospace", fontSize: 12 }}
        />
      </label>
      <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>OpenRouter Key</span>
        <input
          type="password"
          value={openrouterKey}
          onChange={(e) => setOpenrouterKey(e.target.value)}
          placeholder="sk-or-..."
          style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #ccc", width: 200, fontFamily: "monospace", fontSize: 12 }}
        />
      </label>
      <button
        disabled={!ready}
        onClick={() => onReady(okraKey, openrouterKey)}
        style={{
          padding: "4px 16px",
          borderRadius: 4,
          border: "none",
          background: ready ? "#2563eb" : "#ccc",
          color: "#fff",
          cursor: ready ? "pointer" : "default",
          fontSize: 13,
        }}
      >
        Save
      </button>
    </div>
  );
}
