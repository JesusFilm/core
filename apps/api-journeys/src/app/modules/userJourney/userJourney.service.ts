import { Inject, Injectable } from '@nestjs/common'
import { GraphQLError } from 'graphql'
import {
  UserJourney,
  UserJourneyRole,
  Prisma
} from '.prisma/api-journeys-client'
import { v4 as uuidv4 } from 'uuid'
import { PrismaService } from '../../lib/prisma.service'
import { IdType } from '../../__generated__/graphql'

@Injectable()
export class UserJourneyService {
  @Inject(PrismaService) private readonly prismaService: PrismaService

  async requestAccess(
    journeyId: string,
    idType: IdType,
    userId: string
  ): Promise<UserJourney | undefined> {
    const where: Prisma.JourneyWhereUniqueInput =
      idType === IdType.slug ? { slug: journeyId } : { id: journeyId }

    const journey = await this.prismaService.journey.findUnique({
      where
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
