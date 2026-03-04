import { DataProvider } from "react-admin";

interface CollectionDocument {
  id: string;
  file_name: string;
  status: string;
  page_count: number;
  created_at: string;
  [key: string]: unknown;
}

function getCollectionId(): string {
  return (
    import.meta.env.VITE_COLLECTION_ID ||
    localStorage.getItem("okra_collection_id") ||
    ""
  );
}

let cache: CollectionDocument[] | null = null;

async function fetchCollection(): Promise<CollectionDocument[]> {
  if (cache) return cache;
  const collectionId = getCollectionId();
  if (!collectionId) throw new Error("Set VITE_COLLECTION_ID env var or okra_collection_id in localStorage");
  // Public collections don't require auth — fetch without API key
  const res = await fetch(`https://api.okrapdf.com/v1/collections/${encodeURIComponent(collectionId)}`);
  if (!res.ok) throw new Error(`Failed to fetch collection: ${res.status}`);
  const col = await res.json();
  cache = col.documents;
  return cache!;
}

export function clearCache() {
  cache = null;
}

function applySort(data: CollectionDocument[], field: string, order: string) {
  return [...data].sort((a, b) => {
    const av = (a as unknown as Record<string, unknown>)[field];
    const bv = (b as unknown as Record<string, unknown>)[field];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === "string" && typeof bv === "string") {
      return order === "ASC" ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    const diff = (av as number) - (bv as number);
    return order === "ASC" ? diff : -diff;
  });
}

function applyFilter(data: CollectionDocument[], filter: Record<string, unknown>) {
  if (!filter.q) return data;
  const q = String(filter.q).toLowerCase();
  return data.filter(
    (d) => d.file_name && d.file_name.toLowerCase().includes(q)
  );
}

export const dataProvider: DataProvider = {
  getList: async (_resource, params) => {
    const docs = await fetchCollection();
    const { field, order } = params.sort ?? { field: "file_name", order: "ASC" };
    const sorted = applySort(docs, field, order);
    const filtered = applyFilter(sorted, params.filter ?? {});
    const { page = 1, perPage = 25 } = params.pagination ?? {};
    const start = (page - 1) * perPage;
    return {
      data: filtered.slice(start, start + perPage) as any[],
      total: filtered.length,
    };
  },

  getOne: async (_resource, params) => {
    const docs = await fetchCollection();
    const doc = docs.find((d) => d.id === params.id);
    if (!doc) throw new Error(`Document ${params.id} not found`);
    return { data: doc as any };
  },

  // Read-only stubs
  getMany: async () => ({ data: [] }),
  getManyReference: async () => ({ data: [], total: 0 }),
  create: async () => { throw new Error("Read-only"); },
  update: async () => { throw new Error("Read-only"); },
  updateMany: async () => ({ data: [] }),
  delete: async () => { throw new Error("Read-only"); },
  deleteMany: async () => ({ data: [] }),
};
