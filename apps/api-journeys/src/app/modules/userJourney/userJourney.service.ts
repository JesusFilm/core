import { Inject, Injectable } from '@nestjs/common'
import { GraphQLError } from 'graphql'
import {
  UserJourney,
  UserJourneyRole,
  UserTeamRole
} from '.prisma/api-journeys-client'
import { v4 as uuidv4 } from 'uuid'
import { PrismaService } from '../../lib/prisma.service'
import { JourneyService } from '../journey/journey.service'
import { IdType } from '../../__generated__/graphql'

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

    if (journey == null)
      throw new GraphQLError('journey does not exist', {
        extensions: { code: 'NOT_FOUND' }
      })

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

  async approveAccess(
    id: string,
    approverUserId: string
  ): Promise<UserJourney | null> {
    const userJourney = await this.prismaService.userJourney.findUnique({
      where: { id }
    })

    if (userJourney == null)
      throw new GraphQLError('userJourney does not exist', {
        extensions: { code: 'NOT_FOUND' }
      })

    const actor = await this.prismaService.userJourney.findUnique({
      where: { journeyId_userId: { journeyId: id, userId: approverUserId } }
    })
    const requesterUserId = userJourney.userId

    if (actor?.role === UserJourneyRole.inviteRequested)
      throw new GraphQLError('You do not have permission to approve access', {
        extensions: { code: 'FORBIDDEN' }
      })

    const journey = await this.prismaService.journey.findUnique({
      where: { id: userJourney.journeyId }
    })

    if (journey == null)
      throw new GraphQLError('journey does not exist', {
        extensions: { code: 'NOT_FOUND' }
      })

    return await this.prismaService.userJourney.update({
      where: { id },
      data: { role: UserJourneyRole.editor }
    })
  }
}
