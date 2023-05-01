import { Inject, Injectable } from '@nestjs/common'
import { AuthenticationError, UserInputError } from 'apollo-server-errors'
import { UserJourney, UserJourneyRole } from '.prisma/api-journeys-client'
import { v4 as uuidv4 } from 'uuid'
import { IdType } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'
import { JourneyService } from '../journey/journey.service'

@Injectable()
export class UserJourneyService {
  @Inject(PrismaService) private readonly prismaService: PrismaService
  @Inject(JourneyService)
  private readonly journeyService: JourneyService

  async requestAccess(
    journeyId: string,
    idType: IdType,
    userId: string
  ): Promise<UserJourney | undefined> {
    const journey =
      idType === IdType.slug
        ? await this.journeyService.getBySlug(journeyId)
        : await this.prismaService.journey.findUnique({
            where: { id: journeyId }
          })

    if (journey == null) throw new UserInputError('journey does not exist')

    const existingUserJourney = await this.prismaService.userJourney.findUnique(
      {
        where: { journeyId_userId: { journeyId, userId } }
      }
    )

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
    const userJourney = await this.prismaService.userJourney.findUnique({
      where: { id }
    })

    if (userJourney == null)
      throw new UserInputError('userJourney does not exist')

    const actor = await this.prismaService.userJourney.findUnique({
      where: { journeyId_userId: { journeyId: id, userId } }
    })

    if (actor?.role === UserJourneyRole.inviteRequested)
      throw new AuthenticationError(
        'You do not have permission to approve access'
      )

    const journey = await this.prismaService.journey.findUnique({
      where: { id: userJourney.journeyId }
    })

    if (journey == null) throw new UserInputError('journey does not exist')

    if (journey.teamId != null) {
      const existingMember = await this.prismaService.member.findUnique({
        where: { teamId_userId: { userId, teamId: journey.teamId } }
      })

      if (existingMember == null) {
        await this.prismaService.member.create({
          data: {
            id: `${userId}:${(journey as { teamId: string }).teamId}`,
            userId,
            teamId: journey.teamId
          }
        })
      }
    }

    return await this.prismaService.userJourney.update({
      where: { id },
      data: { role: UserJourneyRole.editor }
    })
  }
}
