import { BaseService } from '@core/nest/database'
import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { DocumentCollection } from 'arangojs/collection'
import { KeyAsId } from '@core/nest/decorators'

import { User } from '../../__generated__/graphql'

@Injectable()
export class UserService extends BaseService {
  collection: DocumentCollection = this.db.collection('users')
  @KeyAsId()
  async getByUserId(userId: string): Promise<User> {
    const res = await this.db.query(aql`
    FOR user in ${this.collection}
      FILTER user.userId == ${userId}
      LIMIT 1
      RETURN user
  `)
    return await res.next()
  }
}
