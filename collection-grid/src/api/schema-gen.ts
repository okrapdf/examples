import { z } from "zod";
import type { FieldType } from "../types";

const VALID_TYPES = ["string", "number", "integer", "boolean"] as const;

const SchemaKV = z
  .record(
    z.string().regex(/^[a-z][a-z0-9_]*$/),
    z.enum(VALID_TYPES)
  )
  .refine((obj) => Object.keys(obj).length === 1, "Must have exactly one field");

export interface SchemaResult {
  fieldName: string;
  fieldType: FieldType;
}

export async function generateSchema(
  description: string,
  openrouterKey: string
): Promise<SchemaResult> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openrouterKey}`,
    },
    body: JSON.stringify({
      model: "anthropic/claude-sonnet-4",
      messages: [
        {
          role: "system",
          content:
            'Given a column description, output a JSON object with one key (snake_case field name) and one value (the JSON Schema type: string, number, integer, boolean). Nothing else.',
        },
        { role: "user", content: description },
      ],
      response_format: { type: "json_object" },
      temperature: 0,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter error: ${res.status} ${text}`);
  }

  const data = await res.json();
  const raw = data.choices[0].message.content;
  const parsed = JSON.parse(raw);
  const validated = SchemaKV.parse(parsed);
  const [fieldName, fieldType] = Object.entries(validated)[0];
  return { fieldName, fieldType: fieldType as FieldType };
}
