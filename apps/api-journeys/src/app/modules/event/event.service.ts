import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { BaseService } from '@core/nest/database/BaseService'
import { DocumentCollection } from 'arangojs/collection'
import { KeyAsId } from '@core/nest/decorators/KeyAsId'
import { Visitor } from '../../__generated__/graphql'

@Injectable()
export class EventService extends BaseService {
  collection: DocumentCollection = this.db.collection('events')

  @KeyAsId()
  async getVisitorByUserIdAndJourneyId(
    userId: string,
    journeyId: string
  ): Promise<Visitor> {
    const res = await this.db.query(aql`
      FOR v in visitors
        FILTER v.userId == ${userId}
        FOR j in journeys
          FILTER j._key == ${journeyId} AND j.teamId == v.teamId
          LIMIT 1
          RETURN v
    `)
    return await res.next()
  }
}
