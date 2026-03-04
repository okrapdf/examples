import type { Collection } from "../types";

export async function fetchCollection(collectionId: string): Promise<Collection> {
  const res = await fetch(
    `https://api.okrapdf.com/v1/collections/${collectionId}`
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch collection: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
