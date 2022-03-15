import { Inject, Injectable } from '@nestjs/common'
import { DocumentCollection } from 'arangojs/collection'
import { aql, Database } from 'arangojs'
import { DeepMockProxy } from 'jest-mock-extended'
import { DocumentData, Patch } from 'arangojs/documents'

@Injectable()
export abstract class BaseService {
  constructor(
    @Inject('DATABASE') public readonly db: Database | DeepMockProxy<Database>
  ) {}

  abstract collection: DocumentCollection

  removeQuotes(str: string): string {
    return str.replace(/'/g, '')
  }

  async getAll<T>(): Promise<T[]> {
    const rst = await this.db.query(aql`
    FOR item IN ${this.collection}
      RETURN item`)
    return await rst.all()
  }

  async get<T>(_key: string): Promise<T> {
    const rst = await this.db.query(aql`
    FOR item IN ${this.collection}
      FILTER item._key == ${_key}
      LIMIT 1
      RETURN item`)
    return await rst.next()
  }

  async update<T, T2>(_key: string, body: T2): Promise<T> {
    const result = await this.collection.update(_key, body, { returnNew: true })
    return result.new
  }

  async updateAll<T>(
    arr: Array<Patch<DocumentData<T>> & ({ _key: string } | { _id: string })>
  ): Promise<T[]> {
    const result = await this.collection.updateAll(arr, {
      returnNew: true
    })
    return result.map((item) => item.new)
  }

  async save<T, T2>(body: T2): Promise<T> {
    const result = await this.collection.save(body, { returnNew: true })
    return result.new
  }

  async remove<T>(_key: string): Promise<T> {
    const result = await this.collection.remove(_key, { returnOld: true })
    return result.old
  }

  async count(): Promise<number> {
    const result = await this.collection.count()
    return result.count
  }
}
