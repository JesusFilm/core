import { BaseService } from '@core/nest/database/BaseService'
import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { KeyAsId } from '@core/nest/decorators/KeyAsId'

import { User } from '../../__generated__/graphql'

@Injectable()
export class UserService extends BaseService {
  collection = this.db.collection('users')
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
