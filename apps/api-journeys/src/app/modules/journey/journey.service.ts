import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { BaseService } from '@core/nest/database'
import { DocumentCollection } from 'arangojs/collection'
import {
  Journey,
  JourneyStatus,
  UserJourneyRole
} from '../../__generated__/graphql'

@Injectable()
export class JourneyService extends BaseService {
  async getAllPublishedJourneys(): Promise<Journey[]> {
    const rst = await this.db.query(aql`
    FOR journey IN ${this.collection}
      FILTER journey.status == ${JourneyStatus.published}
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

  async getAllByOwnerEditor(userId: string): Promise<Journey[]> {
    const result = await this.db.query(aql`
    FOR userJourney in userJourneys
      FOR journey in ${this.collection}
          FILTER userJourney.journeyId == journey._key && userJourney.userId == ${userId}
           && (userJourney.role == ${UserJourneyRole.owner} || userJourney.role == ${UserJourneyRole.editor})
          RETURN journey
    `)
    return await result.all()
  }

  collection: DocumentCollection = this.db.collection('journeys')
}
