import { BaseService } from '@core/nest/database/BaseService'
import { KeyAsId } from '@core/nest/decorators/KeyAsId'
import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { JourneyProfile } from '../../__generated__/graphql'

@Injectable()
export class JourneyProfileService extends BaseService {
  collection = this.db.collection('journeyProfiles')

  @KeyAsId()
  async getJourneyProfileByUserId(userId: string): Promise<JourneyProfile> {
    const response = await this.db.query(aql`
      FOR user in ${this.collection}
        FILTER user.userId == ${userId}
        LIMIT 1
        RETURN user
    `)

    return response.hasNext
      ? await response.next()
      : await this.save({ userId, acceptedTermsAt: null })
  }
}
