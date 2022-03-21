import { BaseService } from '@core/nest/database'
import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { DocumentCollection } from 'arangojs/collection'
import { KeyAsId } from '@core/nest/decorators'

@Injectable()
export class LanguageService extends BaseService {
  collection: DocumentCollection = this.db.collection('languages')

  @KeyAsId()
  async getAll<T>(page = 1, limit = 1000): Promise<T[]> {
    const offset = limit * (page - 1)
    const res = await this.db.query(aql`
      FOR item IN ${this.collection}
        LIMIT ${offset}, ${limit}
        RETURN item
    `)
    return await res.all()
  }
}
