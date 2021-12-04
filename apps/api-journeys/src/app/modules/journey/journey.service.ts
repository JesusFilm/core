import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'

import { BaseService } from '../database/base.service'
import { DocumentCollection } from 'arangojs/collection'
import { Journey } from '../../graphql'

@Injectable()
export class JourneyService extends BaseService {
  async getAllPublishedJourneys(): Promise<Journey[]> {
    const rst = await this.db.query(aql`
    FOR journey IN ${this.collection}
      FILTER journey.published == true
      RETURN journey`)
    return await rst.all()
  }

  async getBySlug(_key: string): Promise<Journey> {
    const result = await this.db.query(aql`
      FOR journey in ${this.collection}
        FILTER journey.slug == ${_key}
        LIMIT 1
        RETURN journey
    `)
    return await result.next()
  }

  collection: DocumentCollection = this.db.collection('journeys')
}
