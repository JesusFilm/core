import { BaseService } from '@core/nest/database'
import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { DocumentCollection } from 'arangojs/collection'
import { KeyAsId } from '@core/nest/decorators/KeyAsId'

@Injectable()
export class LanguageService extends BaseService {
  collection: DocumentCollection = this.db.collection('languages')

  @KeyAsId()
  async getAll<T>(offset = 0, limit = 1000): Promise<T[]> {
    const res = await this.db.query(aql`
      FOR item IN ${this.collection}
        LIMIT ${offset}, ${limit}
        RETURN item
    `)
    return await res.all()
  }

  @KeyAsId()
  async getByBcp47<T>(_key: string): Promise<T> {
    const res = await this.db.query(aql`
      FOR item in ${this.collection}
        FILTER item.bcp47 == ${_key}
        LIMIT 1
        RETURN item
    `)
    return await res.next()
  }
}
