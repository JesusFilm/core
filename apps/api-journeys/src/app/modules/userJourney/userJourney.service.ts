import { BaseService } from '@core/nest/database'
import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { DocumentCollection } from 'arangojs/collection'
import { KeyAsId } from '@core/nest/decorators'

import { Journey, UserJourney } from '../../__generated__/graphql'

@Injectable()
export class UserJourneyService extends BaseService {
  collection: DocumentCollection = this.db.collection('userJourneys')

  @KeyAsId()
  async forJourney(journey: Journey): Promise<UserJourney[]> {
    const res = await this.db.query(aql`
      FOR j in ${this.collection}
        FILTER j.journeyId == ${journey.id}
        RETURN j
    `)
    return await res.all()
  }

  @KeyAsId()
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
