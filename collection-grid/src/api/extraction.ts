import { buildResponseFormat } from "../lib/schema-decorator";
import type { FieldType } from "../types";

export interface ExtractionEvent {
  type: "start" | "result" | "done" | "error";
  query_id?: string;
  doc_id?: string;
  doc_count?: number;
  status?: string;
  answer?: string;
  error?: string;
  completed?: number;
  failed?: number;
  trace?: Array<{ name: string; args: unknown; result: unknown }>;
}

/**
 * Fan-out extraction via collection query endpoint (NDJSON stream).
 * One HTTP call — server does the fan-out.
 */
export async function streamCollectionQuery(
  collectionId: string,
  description: string,
  fieldName: string,
  fieldType: FieldType,
  okraKey: string,
  onEvent: (event: ExtractionEvent) => void,
): Promise<void> {
  const res = await fetch(
    `https://api.okrapdf.com/v1/collections/${collectionId}/query`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${okraKey}`,
      },
      body: JSON.stringify({
        prompt: `Extract: ${description}`,
        response_format: buildResponseFormat(fieldName, fieldType),
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Collection query error: ${res.status} ${text}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop()!; // keep incomplete line

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        onEvent(JSON.parse(trimmed));
      } catch {
        // skip malformed lines
      }
    }
  }

  // flush remaining
  if (buffer.trim()) {
    try {
      onEvent(JSON.parse(buffer.trim()));
    } catch {
      // skip
    }
  }
}
