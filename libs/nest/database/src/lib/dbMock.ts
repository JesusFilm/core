import { Database } from 'arangojs'
import { DocumentCollection } from 'arangojs/collection'
import { ArrayCursor, BatchedArrayCursor } from 'arangojs/cursor'
import { Document, DocumentMetadata } from 'arangojs/documents'

export const mockDbQueryResult = async <T>(
  db: Database,
  result: T[]
): Promise<ArrayCursor> =>
  await Promise.resolve(
    new BatchedArrayCursor(
      db,
      {
        extra: {},
        result: result,
        hasMore: false,
        id: '',
        count: result.length
      },
      1,
      false
    ).items
  )

export const mockCollectionSaveResult = async <T>(
  collection: DocumentCollection,
  result: T & { _key: string }
): Promise<DocumentMetadata & { new?: Document }> =>
  await Promise.resolve({
    _key: result._key,
    _id: `${collection.name}/${result._key}`,
    _rev: '1',
    new: result
  })

export const mockCollectionRemoveResult = async <T>(
  collection: DocumentCollection,
  result: T & { _key: string }
): Promise<DocumentMetadata & { new?: Document }> =>
  await Promise.resolve({
    _key: result._key,
    _id: `${collection.name}/${result._key}`,
    _rev: '1',
    old: result
  })

export const mockCollectionUpdateAllResult = async <T>(
  collection: DocumentCollection,
  results: Array<T & { _key: string }>
): Promise<Array<DocumentMetadata & { new?: Document }>> =>
  await Promise.resolve(
    results.map((result) => ({
      _key: result._key,
      _id: `${collection.name}/${result._key}`,
      _rev: '1',
      new: result
    }))
  )
