import { BaseService } from '@core/nest/database/BaseService'
import { KeyAsId } from '@core/nest/decorators/KeyAsId'
import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { DocumentCollection } from 'arangojs/collection'
import { UserInvite } from '../../__generated__/graphql'

@Injectable()
export class UserInviteService extends BaseService {
  collection: DocumentCollection = this.db.collection('userInvites')

  @KeyAsId()
  async getUserInviteByJourneyAndEmail(
    journeyId: string,
    email: string
  ): Promise<UserInvite> {
    const res = await this.db.query(aql`
      FOR userInvite in ${this.collection}
        FILTER userInvite.journeyId == ${journeyId} && userInvite.email == ${email}
        LIMIT 1
        RETURN userInvite
    `)

    return await res.next()
  }

  @KeyAsId()
  async getAllUserInvitesByEmail(email: string): Promise<UserInvite[]> {
    const res = await this.db.query(aql`
      FOR userInvite in ${this.collection}
        FILTER userInvite.email == ${email}
        RETURN userInvite
    `)

    return await res.all()
  }

  @KeyAsId()
  async getAllUserInvitesByJourney(journeyId: string): Promise<UserInvite[]> {
    const res = await this.db.query(aql`
      FOR userInvite in ${this.collection}
        FILTER userInvite.journeyId == ${journeyId}
        RETURN userInvite
    `)

    return await res.all()
  }
}
