import { BaseService } from '@core/nest/database'
import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { DocumentCollection } from 'arangojs/collection'

@Injectable()
export class LanguageService extends BaseService {
  collection: DocumentCollection = this.db.collection('languages')

  async getAll<T>(offset = 0, limit = 1000): Promise<T[]> {
    const res = await this.db.query(aql`
      FOR item IN ${this.collection}
        LIMIT ${offset}, ${limit}
        RETURN item
    `)
    return await res.all()
  }
}
