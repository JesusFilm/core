import { BaseService } from '@core/nest/database/BaseService'
import { Inject, Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { KeyAsId } from '@core/nest/decorators/KeyAsId'
import { AuthenticationError, UserInputError } from 'apollo-server-errors'
import { ArrayCursor } from 'arangojs/cursor'
import { v4 as uuidv4 } from 'uuid'
import { IdType, Journey, UserJourneyRole } from '../../__generated__/graphql'
import { JourneyService } from '../journey/journey.service'
import { MemberService } from '../member/member.service'

export interface UserJourneyRecord {
  id: string
  role: UserJourneyRole
  userId: string
  journeyId: string
  openedAt?: string
}

@Injectable()
export class UserJourneyService extends BaseService<UserJourneyRecord> {
  @Inject(JourneyService)
  private readonly journeyService: JourneyService

  @Inject(MemberService)
  private readonly memberService: MemberService

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

  @KeyAsId()
  async requestAccess(
    journeyId: string,
    idType: IdType,
    userId: string
  ): Promise<UserJourneyRecord | undefined> {
    const journey: Journey =
      idType === IdType.slug
        ? await this.journeyService.getBySlug(journeyId)
        : await this.journeyService.get(journeyId)

    if (journey == null) throw new UserInputError('journey does not exist')

    const existingUserJourney = await this.forJourneyUser(journeyId, userId)

    // Return existing access request or do nothing if user has access
    if (existingUserJourney != null) {
      return existingUserJourney.role === UserJourneyRole.inviteRequested
        ? existingUserJourney
        : undefined
    }

    return await this.save({
      id: uuidv4(),
      userId,
      journeyId: journey.id,
      role: UserJourneyRole.inviteRequested
    })
  }

  @KeyAsId()
  async approveAccess(
    id: string,
    userId: string
  ): Promise<UserJourneyRecord | undefined> {
    const userJourney = await this.get(id)

    if (userJourney == null)
      throw new UserInputError('userJourney does not exist')

    const actor = await this.forJourneyUser(id, userId)

    if (actor?.role === UserJourneyRole.inviteRequested)
      throw new AuthenticationError(
        'You do not have permission to approve access'
      )

    const journey = await this.journeyService.get(userJourney.journeyId)

    if (journey.teamId != null) {
      const existingMember = this.memberService.getMemberByTeamId(
        userId,
        journey.teamId
      )

      if (existingMember == null) {
        await this.memberService.save(
          {
            id: `${userId}:${(journey as { teamId: string }).teamId}`,
            userId,
            teamId: journey.teamId
          },
          { overwriteMode: 'ignore' }
        )
      }
    }

    return await this.update(id, {
      role: UserJourneyRole.editor
    })
  }
}
