import { BaseService } from '@core/nest/database/BaseService'
import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { KeyAsId } from '@core/nest/decorators/KeyAsId'
import { ArrayCursor } from 'arangojs/cursor'
import { Journey, UserJourneyRole } from '../../__generated__/graphql'

export interface UserJourneyRecord {
  id: string
  role: UserJourneyRole
  userId: string
  journeyId: string
  openedAt?: string
}

@Injectable()
export class UserJourneyService extends BaseService<UserJourneyRecord> {
  collection = this.db.collection<UserJourneyRecord>('userJourneys')

  @KeyAsId()
  async forJourney(journey: Journey): Promise<UserJourneyRecord[]> {
    const res = (await this.db.query(aql`
      FOR item in ${this.collection}
        FILTER item.journeyId == ${journey.id}
        RETURN item
    `)) as ArrayCursor<UserJourneyRecord>
    return await res.all()
  }

  @KeyAsId()
  async forJourneyUser(
    journeyId: string,
    userId: string
  ): Promise<UserJourneyRecord | undefined> {
    const res = (await this.db.query(aql`
      FOR item in ${this.collection}
        FILTER item.journeyId == ${journeyId} && item.userId == ${userId}
        LIMIT 1
        RETURN item
    `)) as ArrayCursor<UserJourneyRecord>
    return await res.next()
  }
}
