import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);

export async function upsertVector(id: string, vector: number[], metadata: Record<string, string>) {
  await index.upsert({ records: [{ id, values: vector, metadata }] } as any);
}

export async function searchVectors(vector: number[], topK: number = 5) {
  const results = await index.query({
    vector,
    topK,
    includeMetadata: true,
  });
  return results.matches;
}

export async function deleteVector(id: string) {
  await index.deleteOne({ ids: [id] } as any);
}