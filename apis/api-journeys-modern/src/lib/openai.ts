import { openai } from '@ai-sdk/openai'
import { Embedding, embed, embedMany } from 'ai'

const embeddingModel = openai.embedding('text-embedding-ada-002')

export async function createEmbedding(text: string): Promise<Embedding> {
  const { embedding } = await embed({
    model: embeddingModel,
    value: text
  })
  return embedding
}

export async function createEmbeddings(texts: string[]): Promise<Embedding[]> {
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: texts
  })
  return embeddings
}
