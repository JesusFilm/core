import { Inject, Injectable } from '@nestjs/common'
import { Database, aql } from 'arangojs'
import {
  CollectionInsertOptions,
  DocumentCollection,
  EdgeCollection
} from 'arangojs/collection'
import { Document, DocumentData, Patch } from 'arangojs/documents'
import DataLoader from 'dataloader'
import { DeepMockProxy } from 'jest-mock-extended'

import { IdAsKey } from '@core/nest/decorators/IdAsKey'
import { KeyAsId } from '@core/nest/decorators/KeyAsId'

@Injectable()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export abstract class BaseService<T extends Record<string, any> = any> {
  constructor(
    @Inject('DATABASE') public readonly db: Database | DeepMockProxy<Database>
  ) {
    this.getByIdsDataLoader = new DataLoader<string, T>(
      async (ids: readonly string[]) => {
        const items: T[] = []
        const data = await this.getByIds(ids)
        data.forEach((item) => {
          items[ids.indexOf(item.id)] = item
        })
        return items
      }
    )
  }

  abstract collection: DocumentCollection<T> & EdgeCollection<T>

  removeQuotes(str: string): string {
    return str.replace(/'/g, '')
  }

  @KeyAsId()
  async getAll(): Promise<T[]> {
    const rst = await this.db.query(aql`
    FOR item IN ${this.collection}
      RETURN item`)
    return await rst.all()
  }

  @KeyAsId()
  async get(_key: string): Promise<T> {
    const rst = await this.db.query(aql`
    FOR item IN ${this.collection}
      FILTER item._key == ${_key}
      LIMIT 1
      RETURN item`)
    return await rst.next()
  }

  private readonly getByIdsDataLoader: DataLoader<string, T>
  async load(_key: string): Promise<T | Error> {
    return await this.getByIdsDataLoader.load(_key)
  }

  async loadMany(_keys: string[]): Promise<Array<T | Error>> {
    return await this.getByIdsDataLoader.loadMany(_keys)
  }

  @KeyAsId()
  async getByIds(_keys: readonly string[]): Promise<T[]> {
    const rst = await this.db.query(aql`
    FOR item IN ${this.collection}
      FILTER item._key IN ${_keys}
      RETURN item`)
    return await rst.all()
  }

  @KeyAsId()
  async update(
    _key: string,
    body: Patch<DocumentData<T>>
  ): Promise<Document<T> | undefined> {
    const result = await this.collection.update(_key, body, { returnNew: true })
    return result.new
  }

  @IdAsKey()
  async updateAll(
    arr: Array<
      Patch<DocumentData<T>> &
        (
          | {
              _key: string
            }
          | {
              _id: string
            }
        )
    >
  ): Promise<Array<Document<T> | undefined>> {
    const result = await this.collection.updateAll(arr, {
      returnNew: true
    })
    return result.map((item) => item.new)
  }

  @IdAsKey()
  async save(
    body: DocumentData<T>,
    options: CollectionInsertOptions = { returnNew: true }
  ): Promise<Document<T> | undefined> {
    const result = await this.collection.save(body, options)
    return result.new
  }

  @IdAsKey()
  async saveAll(
    arr: Array<DocumentData<T>>
  ): Promise<Array<Document<T> | undefined>> {
    const result = await this.collection.saveAll(arr, {
      returnNew: true
    })
    return result.map((item) => item.new)
  }

  @KeyAsId()
  async remove(_key: string): Promise<Document<T> | undefined> {
    const result = await this.collection.remove(_key, { returnOld: true })
    return result.old
  }

  @KeyAsId()
  async removeAll(keys: string[]): Promise<Array<Document<T> | undefined>> {
    const result = await this.collection.removeAll(keys, {
      returnOld: true
    })
    return result.map((item) => item.old)
  }

  async count(): Promise<number> {
    const result = await this.collection.count()
    return result.count
  }
}
