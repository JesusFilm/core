import { BaseService } from '@core/nest/database'
import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { DocumentCollection } from 'arangojs/collection'
import { User, UserJourney } from '../../__generated__/graphql'

@Injectable()
export class UserJourneyService extends BaseService {
  collection: DocumentCollection = this.db.collection('userJourneys')
  
  async forUser(user: User): Promise<UserJourney[]> {
    const res = await this.db.query(aql`
      FOR j in ${this.collection}
        FILTER j.userId == ${user.id}
        RETURN j
    `)
    return await res.all()
  }
}