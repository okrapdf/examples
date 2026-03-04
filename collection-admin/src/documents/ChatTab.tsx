import { useMemo, useState } from "react";
import { useRecordContext } from "react-admin";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";

/**
 * Custom fetch: injects model + stream into the request body,
 * then converts OpenAI SSE response to a plain text ReadableStream.
 */
const openaiSseAdapter: typeof fetch = async (url, init) => {
  const raw = JSON.parse(init?.body as string);

  // Convert AI SDK v5 UIMessage format to OpenAI format
  const messages = (raw.messages ?? []).map((m: any) => ({
    role: m.role,
    content: (m.parts ?? [])
      .filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join(""),
  }));

  const body = { messages, model: raw.model || "default", stream: true };
  const res = await fetch(url, { ...init, body: JSON.stringify(body) });
  if (!res.ok || !res.body) return res;

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new Response(
    new ReadableStream({
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) { controller.close(); return; }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          const payload = trimmed.slice(6);
          if (payload === "[DONE]") { controller.close(); return; }
          try {
            const delta = JSON.parse(payload).choices?.[0]?.delta?.content;
            if (delta) controller.enqueue(encoder.encode(delta));
          } catch {}
        }
      },
    }),
    { headers: { "content-type": "text/plain; charset=utf-8" } },
  );
};

function getApiKey(): string | null {
  return import.meta.env.VITE_OKRA_API_KEY || localStorage.getItem("okra_api_key") || null;
}

export const ChatTab = () => {
  const record = useRecordContext();
  const [apiKey, setApiKey] = useState(getApiKey);
  const [keyInput, setKeyInput] = useState("");

  const transport = useMemo(() => {
    if (!record || !apiKey) return undefined;
    return new TextStreamChatTransport({
      api: `https://api.okrapdf.com/document/${record.id}/chat/completions`,
      headers: { Authorization: `Bearer ${apiKey}` },
      body: { model: "default" },
      fetch: openaiSseAdapter,
    });
  }, [record?.id, apiKey]);

  const { messages, sendMessage, status, stop } = useChat({ transport } as any);

  if (!record) return null;

  // Prompt for API key inline when user reaches the chat tab
  if (!apiKey) {
    return (
      <div style={{ maxWidth: 500 }}>
        <p style={{ color: "#4b5563", marginBottom: 12 }}>
          Enter your API key to chat with this document.
          Get one at <a href="https://app.okrapdf.com/sign-up" target="_blank" rel="noopener">app.okrapdf.com/sign-up</a>.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="okra_..."
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && keyInput.trim()) {
                localStorage.setItem("okra_api_key", keyInput.trim());
                setApiKey(keyInput.trim());
              }
            }}
            style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", color: "#111827" }}
          />
          <button
            onClick={() => {
              if (keyInput.trim()) {
                localStorage.setItem("okra_api_key", keyInput.trim());
                setApiKey(keyInput.trim());
              }
            }}
            style={{ padding: "8px 16px", cursor: "pointer" }}
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  const isLoading = status === "streaming" || status === "submitted";

  return (
    <div style={{ maxWidth: 700 }}>
      <div
        style={{
          maxHeight: 400,
          overflow: "auto",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: 12,
          marginBottom: 12,
        }}
      >
        {messages.length === 0 && (
          <p style={{ color: "#6b7280" }}>Ask a question about this document...</p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              marginBottom: 12,
              padding: "8px 12px",
              borderRadius: 8,
              background: m.role === "user" ? "#eff6ff" : "#f3f4f6",
              color: "#111827",
              whiteSpace: "pre-wrap",
            }}
          >
            <strong>{m.role === "user" ? "You" : "OkraPDF"}</strong>
            <div style={{ marginTop: 4 }}>
              {m.parts
                ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
                .map((p, i) => <span key={i}>{p.text}</span>)}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const input = e.currentTarget.elements.namedItem("msg") as HTMLInputElement;
          const text = input.value.trim();
          if (!text || isLoading) return;
          sendMessage({ text });
          input.value = "";
        }}
        style={{ display: "flex", gap: 8 }}
      >
        <input
          name="msg"
          type="text"
          placeholder="Ask a question..."
          disabled={isLoading}
          style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", color: "#111827" }}
        />
        {isLoading ? (
          <button type="button" onClick={stop} style={{ padding: "8px 16px", cursor: "pointer" }}>
            Stop
          </button>
        ) : (
          <button type="submit" style={{ padding: "8px 16px", cursor: "pointer" }}>
            Send
          </button>
        )}
      </form>
    </div>
  );
};
