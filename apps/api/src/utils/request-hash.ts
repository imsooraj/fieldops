
import { createHash } from "node:crypto";

// Sort object keys recursively to produce consistent JSON.
function normalizeObject(value: unknown): unknown {
  try {
    if (Array.isArray(value)) {
      return value.map((item) => normalizeObject(item));
    }

    if (value !== null && typeof value === "object") {
      const sortedObject: Record<string, unknown> = {};

      for (const key of Object.keys(value).sort()) {
        sortedObject[key] = normalizeObject(
          (value as Record<string, unknown>)[key]
        );
      }

      return sortedObject;
    }

    return value;
  } catch (error) {
    console.error("Request normalization failed:", error);
    throw new Error("Unable to normalize request payload");
  }
}

export function generateRequestHash(payload: unknown): string {
  try {
    const normalizedPayload = normalizeObject(payload);
    const serializedPayload = JSON.stringify(normalizedPayload);

    if (serializedPayload === undefined) {
      throw new Error("Invalid request payload");
    }

    return createHash("sha256")
      .update(serializedPayload)
      .digest("hex");
  } catch (error) {
    console.error("Request hash generation failed:", error);
    throw new Error("Unable to generate request hash");
  }
}
