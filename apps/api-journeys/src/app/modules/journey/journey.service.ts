import { Inject, Injectable } from '@nestjs/common'
import { aql, Database } from 'arangojs'

import { BaseService } from '../database/base.service'
import { DocumentCollection } from 'arangojs/collection'

@Injectable()
export class JourneyService extends BaseService {
  constructor(@Inject('DATABASE') private readonly db: Database) {
    super()
  }
  async getBySlug(_key: string) {
    const result = await this.db.query(aql`
      FOR journey in ${this.collection}
      FILTER journey.slug == ${_key}
      LIMIT 1
      RETURN journey
    `);
    return result.next();
  }
  collection: DocumentCollection = this.db.collection('journeys')
}
