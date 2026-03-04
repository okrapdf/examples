import { useState, useEffect } from "react";
import { useRecordContext } from "react-admin";
import { OkraClient, type LogEntry } from "okrapdf";

export const LogsTab = () => {
  const record = useRecordContext();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiKey =
    import.meta.env.VITE_OKRA_API_KEY ||
    localStorage.getItem("okra_api_key");

  useEffect(() => {
    if (!record || !apiKey) return;

    setLoading(true);
    setError(null);

    const client = new OkraClient({ apiKey });
    client
      .logs(record.id as string, { limit: 100 })
      .then(setLogs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [record?.id, apiKey]);

  if (!record) return null;
  if (!apiKey)
    return <p style={{ color: "#6b7280" }}>Logs require an API key. Set one in the Chat tab first.</p>;
  if (loading) return <p>Loading logs...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (logs.length === 0) return <p style={{ color: "#6b7280" }}>No log entries.</p>;

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
            <th style={{ padding: "6px 8px" }}>Seq</th>
            <th style={{ padding: "6px 8px" }}>Event</th>
            <th style={{ padding: "6px 8px" }}>Actor</th>
            <th style={{ padding: "6px 8px" }}>Detail</th>
            <th style={{ padding: "6px 8px" }}>Time</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((entry) => (
            <tr key={entry.seq} style={{ borderBottom: "1px solid #f3f4f6" }}>
              <td style={{ padding: "4px 8px" }}>{entry.seq}</td>
              <td style={{ padding: "4px 8px" }}>{entry.event}</td>
              <td style={{ padding: "4px 8px" }}>{entry.actor_id}</td>
              <td style={{ padding: "4px 8px", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {entry.detail}
              </td>
              <td style={{ padding: "4px 8px", whiteSpace: "nowrap" }}>
                {new Date(entry.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
