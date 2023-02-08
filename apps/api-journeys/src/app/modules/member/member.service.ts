import { Injectable } from '@nestjs/common'
import { BaseService } from '@core/nest/database/BaseService'
import { aql } from 'arangojs'
import { ArrayCursor } from 'arangojs/cursor'
import { KeyAsId } from '@core/nest/decorators/KeyAsId'

interface Member {
  id: string
  userId: string
  teamId: string
}
@Injectable()
export class MemberService extends BaseService {
  collection = this.db.collection('members')

  @KeyAsId()
  async getMemberByTeamId(
    userId: string,
    teamId: string
  ): Promise<Member | undefined> {
    const result = (await this.db.query(aql`
      FOR member in members
        FILTER member.userId == ${userId} AND member.teamId == ${teamId}
        LIMIT 1
        RETURN member
    `)) as ArrayCursor<Member>
    return await result.next()
  }
}
