import { BaseService } from '@core/nest/database'
import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { DocumentCollection } from 'arangojs/collection'
import { Journey, UserJourney } from '../../__generated__/graphql'

@Injectable()
export class UserJourneyService extends BaseService {
  collection: DocumentCollection = this.db.collection('userJourneys')

  async forJourney(journey: Journey): Promise<UserJourney[]> {
    const res = await this.db.query(aql`
      FOR j in ${this.collection}
        FILTER j.journeyId == ${journey.id}
        RETURN j
    `)
    return await res.all()
  }

  async forJourneyUser(
    journeyId: string,
    userId: string
  ): Promise<UserJourney> {
    const res = await this.db.query(aql`
      FOR j in ${this.collection}
        FILTER j.journeyId == ${journeyId} && j.userId == ${userId}
        LIMIT 1
        RETURN j
    `)
    return await res.next()
  }
}
