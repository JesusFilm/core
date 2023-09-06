import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver
} from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

import {
  Journey,
  Prisma,
  UserJourney,
  UserJourneyRole
} from '.prisma/api-journeys-client'
import { CaslAbility, CaslAccessible } from '@core/nest/common/CaslAuthModule'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'

import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('UserJourney')
export class UserJourneyResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  @UseGuards(AppCaslGuard)
  async userJourneys(
    @CaslAccessible('UserJourneys')
    accessibleUserJourneys: Prisma.UserJourneyWhereInput,
    @Parent() journey: Journey
  ): Promise<UserJourney[]> {
    return await this.prismaService.userJourney.findMany({
      where: {
        AND: [accessibleUserJourneys, { journeyId: journey.id }]
      }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async userJourneyRequest(
    @CaslAbility() ability: AppAbility,
    @Args('journeyId') journeyId: string,
    @CurrentUserId() userId: string
  ): Promise<UserJourney> {
    return await this.prismaService.$transaction(async (tx) => {
      const userJourney = await tx.userJourney.upsert({
        where: { journeyId_userId: { journeyId, userId } },
        create: {
          userId,
          journey: { connect: { id: journeyId } },
          role: UserJourneyRole.inviteRequested
        },
        update: {}
      })
      if (!ability.can(Action.Create, subject('UserJourney', userJourney)))
        throw new GraphQLError('user is not allowed to create userJourney', {
          extensions: { code: 'FORBIDDEN' }
        })
      return userJourney
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async userJourneyApprove(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string
  ): Promise<UserJourney> {
    const userJourney = await this.prismaService.userJourney.findUnique({
      where: { id },
      include: {
        journey: {
          include: {
            team: { include: { userTeams: true } },
            userJourneys: true
          }
        }
      }
    })
    if (userJourney == null)
      throw new GraphQLError('userJourney not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (
      !ability.can(Action.Update, subject('UserJourney', userJourney), 'role')
    )
      throw new GraphQLError('user is not allowed to update userJourney', {
        extensions: { code: 'FORBIDDEN' }
      })
    return await this.prismaService.userJourney.update({
      where: { id },
      data: { role: UserJourneyRole.editor }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async userJourneyPromote(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string
  ): Promise<UserJourney> {
    const userJourney = await this.prismaService.userJourney.findUnique({
      where: { id },
      include: {
        journey: {
          include: {
            team: { include: { userTeams: true } },
            userJourneys: true
          }
        }
      }
    })
    if (userJourney == null)
      throw new GraphQLError('userJourney not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (
      !ability.can(Action.Update, subject('UserJourney', userJourney), 'role')
    )
      throw new GraphQLError('user is not allowed to update userJourney', {
        extensions: { code: 'FORBIDDEN' }
      })

    return await this.prismaService.$transaction(async (tx) => {
      await tx.userJourney.updateMany({
        where: {
          journeyId: userJourney.journey.id,
          role: UserJourneyRole.owner
        },
        data: { role: UserJourneyRole.editor }
      })
      return await tx.userJourney.update({
        where: { id },
        data: { role: UserJourneyRole.owner }
      })
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async userJourneyRemove(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string
  ): Promise<UserJourney | undefined> {
    const userJourney = await this.prismaService.userJourney.findUnique({
      where: { id },
      include: {
        journey: {
          include: {
            team: { include: { userTeams: true } },
            userJourneys: true
          }
        }
      }
    })
    if (userJourney == null)
      throw new GraphQLError('userJourney not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(Action.Delete, subject('UserJourney', userJourney)))
      throw new GraphQLError('user is not allowed to delete userJourney', {
        extensions: { code: 'FORBIDDEN' }
      })
    return await this.prismaService.userJourney.delete({ where: { id } })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async userJourneyRemoveAll(
    @CaslAccessible(['UserJourney', Action.Delete])
    accessibleUserJourneys: Prisma.UserJourneyWhereInput,
    @Args('id') journeyId: string
  ): Promise<UserJourney[] | undefined> {
    const userJourneys = await this.prismaService.userJourney.findMany({
      where: { AND: [accessibleUserJourneys, { journeyId }] }
    })
    await this.prismaService.userJourney.deleteMany({
      where: {
        AND: [
          accessibleUserJourneys,
          { id: { in: userJourneys.map(({ id }) => id) } }
        ]
      }
    })
    return userJourneys
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async userJourneyOpen(
    @CaslAbility() ability: AppAbility,
    @Args('id') journeyId: string,
    @CurrentUserId() userId: string
  ): Promise<UserJourney | null> {
    const userJourney = await this.prismaService.userJourney.findUnique({
      where: { journeyId_userId: { journeyId, userId } }
    })
    if (userJourney == null) return null
    if (
      !ability.can(
        Action.Update,
        subject('UserJourney', userJourney),
        'openedAt'
      )
    )
      throw new GraphQLError('user is not allowed to update userJourney', {
        extensions: { code: 'FORBIDDEN' }
      })
    return await this.prismaService.userJourney.update({
      where: { id: userJourney.id },
      data: { openedAt: new Date() }
    })
  }

  @ResolveField()
  async journey(@Parent() userJourney: UserJourney): Promise<Journey | null> {
    return await this.prismaService.journey.findUnique({
      where: { id: userJourney.journeyId }
    })
  }

  @ResolveField('user')
  async user(
    @Parent() userJourney: UserJourney
  ): Promise<{ __typename: string; id: string }> {
    return { __typename: 'User', id: userJourney.userId }
  }
}
