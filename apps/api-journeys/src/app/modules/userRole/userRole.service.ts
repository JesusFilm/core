import { BaseService } from '@core/nest/database/BaseService'
import { KeyAsId } from '@core/nest/decorators/KeyAsId'
import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { UserRole } from '../../__generated__/graphql'

@Injectable()
export class UserRoleService extends BaseService {
  collection = this.db.collection('userRoles')

  @KeyAsId()
  async getUserRoleById(userId: string): Promise<UserRole> {
    const response = await this.db.query(aql`
      FOR user in ${this.collection}
        FILTER user.userId == ${userId}
        LIMIT 1
        RETURN user
    `)

    return response.hasNext
      ? await response.next()
      : await this.save({ userId })
  }
}
