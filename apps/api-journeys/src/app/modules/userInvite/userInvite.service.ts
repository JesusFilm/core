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
  async getAllUserInvitesBySender(userId: string): Promise<UserInvite[]> {
    const response = await this.db.query(aql`
      FOR userInvite in ${this.collection}
        FILTER userInvite.sendBy == ${userId}
        RETURN userInvite
    `)

    return await response.all()
  }
}
