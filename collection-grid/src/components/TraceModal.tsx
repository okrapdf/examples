import type { TraceStep } from "../types";

interface Props {
  trace: TraceStep[];
  onClose: () => void;
}

function formatArgs(args: unknown): string {
  if (typeof args === "string") return args;
  try {
    return JSON.stringify(args, null, 2);
  } catch {
    return String(args);
  }
}

function formatResult(result: unknown): string {
  if (typeof result === "string") {
    // Truncate long SQL results
    return result.length > 500 ? result.slice(0, 500) + "..." : result;
  }
  try {
    const s = JSON.stringify(result, null, 2);
    return s.length > 500 ? s.slice(0, 500) + "..." : s;
  } catch {
    return String(result);
  }
}

export function TraceModal({ trace, onClose }: Props) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 8,
          maxWidth: 720,
          maxHeight: "80vh",
          overflow: "auto",
          padding: 24,
          width: "90vw",
          fontFamily: "monospace",
          fontSize: 12,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontWeight: 700, fontSize: 14, fontFamily: "system-ui" }}>
            Extraction Trace ({trace.length} steps)
          </span>
          <button
            onClick={onClose}
            style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18 }}
          >
            x
          </button>
        </div>
        {trace.map((step, i) => (
          <div key={i} style={{ marginBottom: 16, borderBottom: "1px solid #eee", paddingBottom: 12 }}>
            <div style={{ fontWeight: 600, color: "#2563eb", marginBottom: 4 }}>
              {i + 1}. {step.name}
            </div>
            <div style={{ marginBottom: 4 }}>
              <span style={{ color: "#666" }}>args: </span>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap", background: "#f8f8f8", padding: 8, borderRadius: 4 }}>
                {formatArgs(step.args)}
              </pre>
            </div>
            <div>
              <span style={{ color: "#666" }}>result: </span>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap", background: "#f0fdf4", padding: 8, borderRadius: 4 }}>
                {formatResult(step.result)}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
