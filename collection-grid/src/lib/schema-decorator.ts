import type { FieldType } from "../types";

export function buildResponseFormat(fieldName: string, fieldType: FieldType) {
  return {
    type: "json_schema" as const,
    json_schema: {
      name: "result",
      schema: {
        type: "object",
        properties: { [fieldName]: { type: fieldType } },
        required: [fieldName],
        additionalProperties: false,
      },
    },
  };
}
