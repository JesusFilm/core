import { DocumentCollection } from 'arangojs/collection';
import { ArrayCursor, BatchedArrayCursor } from 'arangojs/cursor';
import { Document, DocumentMetadata } from 'arangojs/documents';

export const mockDbQueryResult = async (db, result: any[]): Promise<ArrayCursor> => await Promise.resolve(new BatchedArrayCursor(db, {
    extra: {},
    result: result,
    hasMore: false,
    id: "",
    count: result.length
}, 1, false).items)

export const mockCollectionSaveResult = async (collection: DocumentCollection, result: any): Promise<DocumentMetadata & { new?: Document }> => await Promise.resolve({
    _key: result._key,
    _id: `${collection.name}/${result._key}`,
    _rev: "1",
    new: result
})

export const mockCollectionRemoveResult = async (collection: DocumentCollection, result: any): Promise<DocumentMetadata & { new?: Document }> => await Promise.resolve({
    _key: result._key,
    _id: `${collection.name}/${result._key}`,
    _rev: "1",
    old: result
})