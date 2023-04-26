import { Inject, Injectable } from '@nestjs/common'
import { AuthenticationError, UserInputError } from 'apollo-server-errors'
import { UserJourney, UserJourneyRole } from '.prisma/api-journeys-client'
import { v4 as uuidv4 } from 'uuid'
import { IdType, Journey } from '../../__generated__/graphql'
import { JourneyService } from '../journey/journey.service'
import { MemberService } from '../member/member.service'
import { PrismaService } from '../../lib/prisma.service'

@Injectable()
export class UserJourneyService {
  @Inject(PrismaService) private readonly prismaService: PrismaService
  @Inject(JourneyService)
  private readonly journeyService: JourneyService

  @Inject(MemberService)
  private readonly memberService: MemberService

  async forJourney(journey: Journey): Promise<UserJourney[]> {
    return await this.prismaService.userJourney.findMany({
      where: { journeyId: journey.id }
    })
  }

  async forJourneyUser(
    journeyId: string,
    userId: string
  ): Promise<UserJourney | null> {
    return await this.prismaService.userJourney.findUnique({
      where: { journeyId_userId: { journeyId, userId } }
    })
  }

  async requestAccess(
    journeyId: string,
    idType: IdType,
    userId: string
  ): Promise<UserJourney | undefined> {
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

    return await this.prismaService.userJourney.create({
      data: {
        id: uuidv4(),
        userId,
        journeyId: journey.id,
        role: UserJourneyRole.inviteRequested
      }
    })
  }

  async approveAccess(id: string, userId: string): Promise<UserJourney | null> {
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

  async get(id: string): Promise<UserJourney | null> {
    return await this.prismaService.userJourney.findUnique({ where: { id } })
  }

  async update(
    id: string,
    data: Partial<UserJourney>
  ): Promise<UserJourney | null> {
    return await this.prismaService.userJourney.update({ where: { id }, data })
  }

  async remove(id: string): Promise<UserJourney | undefined> {
    return await this.prismaService.userJourney.delete({ where: { id } })
  }

  async removeAll(ids: string[]): Promise<Array<UserJourney | undefined>> {
    return await Promise.all(ids.map(async (id) => await this.remove(id)))
  }

  async save(data: UserJourney): Promise<UserJourney> {
    return await this.prismaService.userJourney.create({
      data
    })
  }
}
