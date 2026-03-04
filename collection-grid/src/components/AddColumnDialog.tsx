import { useState } from "react";

interface Props {
  onAdd: (description: string) => void;
  disabled: boolean;
}

export function AddColumnDialog({ onAdd, disabled }: Props) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);

  const submit = () => {
    const desc = value.trim();
    if (!desc) return;
    onAdd(desc);
    setValue("");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        disabled={disabled}
        style={{
          padding: "4px 12px",
          borderRadius: 4,
          border: "1px solid #2563eb",
          background: "#fff",
          color: disabled ? "#999" : "#2563eb",
          cursor: disabled ? "default" : "pointer",
          fontSize: 13,
        }}
      >
        + Add Column
      </button>
    );
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="e.g. Total revenue for fiscal year"
        style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #ccc", width: 300, fontSize: 13 }}
      />
      <button
        onClick={submit}
        disabled={!value.trim()}
        style={{
          padding: "4px 12px",
          borderRadius: 4,
          border: "none",
          background: value.trim() ? "#2563eb" : "#ccc",
          color: "#fff",
          cursor: value.trim() ? "pointer" : "default",
          fontSize: 13,
        }}
      >
        Extract
      </button>
      <button
        onClick={() => { setOpen(false); setValue(""); }}
        style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #ccc", background: "#fff", cursor: "pointer", fontSize: 13 }}
      >
        Cancel
      </button>
    </div>
  );
}
