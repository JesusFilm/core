import { BaseService } from '@core/nest/database/BaseService'
import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { KeyAsId } from '@core/nest/decorators/KeyAsId'

export interface LanguageRecord {
  id: string
  bcp47?: string
  iso3?: string
  name: Array<{ value: string; languageId: string; primary: boolean }>
}

@Injectable()
export class LanguageService extends BaseService<LanguageRecord> {
  collection = this.db.collection<LanguageRecord>('languages')

  @KeyAsId()
  async getAll(offset = 0, limit = 1000): Promise<LanguageRecord[]> {
    const res = await this.db.query(aql`
      FOR item IN ${this.collection}
        LIMIT ${offset}, ${limit}
        RETURN item
    `)
    return await res.all()
  }

  @KeyAsId()
  async getByBcp47(_key: string): Promise<LanguageRecord> {
    const res = await this.db.query(aql`
      FOR item in ${this.collection}
        FILTER item.bcp47 == ${_key}
        LIMIT 1
        RETURN item
    `)
    return await res.next()
  }
}
