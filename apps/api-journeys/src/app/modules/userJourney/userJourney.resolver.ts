import {
  Args,
  Resolver,
  Mutation,
  Parent,
  Query,
  ResolveField
} from '@nestjs/graphql'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import {
  UserJourney,
  Journey,
  UserJourneyRole
} from '.prisma/api-journeys-client'
import { AuthenticationError, UserInputError } from 'apollo-server-errors'
import { IdType, Role } from '../../__generated__/graphql'
import { RoleGuard } from '../../lib/roleGuard/roleGuard'
import { PrismaService } from '../../lib/prisma.service'
import { UserJourneyService } from './userJourney.service'

@Resolver('UserJourney')
export class UserJourneyResolver {
  constructor(
    private readonly userJourneyService: UserJourneyService,
    private readonly prismaService: PrismaService
  ) {}

  @Query()
  async userJourneys(@Parent() journey: Journey): Promise<UserJourney[]> {
    return await this.prismaService.userJourney.findMany({
      where: { journeyId: journey.id }
    })
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async userJourneyRequest(
    @Args('journeyId') journeyId: string,
    @Args('idType') idType: IdType = IdType.slug,
    @CurrentUserId() userId: string
  ): Promise<UserJourney | undefined> {
    return await this.userJourneyService.requestAccess(
      journeyId,
      idType,
      userId
    )
  }

  async checkOwnership(id: string, userId: string): Promise<UserJourney> {
    // can only update user journey roles if you are the journey's owner.
    const actor = await this.prismaService.userJourney.findUnique({
      where: {
        journeyId_userId: { journeyId: id, userId }
      }
    })
    if (actor?.role !== UserJourneyRole.owner)
      throw new AuthenticationError(
        'You do not own this journey, so you cannot make changes to it'
      )

    return actor
  }

  async getUserJourney(id: string): Promise<UserJourney | undefined> {
    const userJourney = await this.prismaService.userJourney.findUnique({
      where: { id }
    })
    if (userJourney === null) throw new UserInputError('User journey not found')
    return userJourney
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async userJourneyApprove(
    @Args('id') id: string,
    @CurrentUserId() userId: string
  ): Promise<UserJourney | null> {
    return await this.userJourneyService.approveAccess(id, userId)
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async userJourneyPromote(
    @Args('id') id: string,
    @CurrentUserId() userId: string
  ): Promise<UserJourney | null> {
    const userJourney = await this.getUserJourney(id)

    if (userJourney == null)
      throw new UserInputError('userJourney does not exist')

    const actor = await this.checkOwnership(userJourney.journeyId, userId)
    if (actor.userId === userJourney.userId) return actor

    const newOwner = await this.prismaService.userJourney.update({
      where: { id },
      data: { role: UserJourneyRole.owner }
    })

    await this.prismaService.userJourney.update({
      where: { id: actor.id },
      data: { role: UserJourneyRole.editor }
    })
    return newOwner
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async userJourneyRemove(
    @Args('id') id: string,
    @CurrentUserId() userId: string
  ): Promise<UserJourney | undefined> {
    const userJourney = await this.getUserJourney(id)

    if (userJourney == null)
      throw new UserInputError('userJourney does not exist')

    if (userJourney.role !== UserJourneyRole.inviteRequested) {
      await this.checkOwnership(userJourney.journeyId, userId)
    }

    return await this.prismaService.userJourney.delete({ where: { id } })
  }

  @Mutation()
  @UseGuards(
    GqlAuthGuard,
    RoleGuard('id', { role: Role.publisher, attributes: { template: true } })
  )
  async userJourneyRemoveAll(
    @Args('id') id: string
  ): Promise<UserJourney[] | undefined> {
    const journey = await this.prismaService.journey.findUnique({
      where: { id }
    })
    if (journey == null) throw new UserInputError('Journey does not exist')

    const userJourneys = await this.prismaService.userJourney.findMany({
      where: { journeyId: journey.id }
    })
    const userJourneyIds: string[] = userJourneys.map(
      (userJourney) => userJourney.id
    )

    const result = await Promise.all(
      userJourneyIds.map(
        async (id) =>
          await this.prismaService.userJourney.delete({ where: { id } })
      )
    )
    return result != null ? userJourneys : undefined
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async userJourneyOpen(
    @Args('id') id: string,
    @CurrentUserId() userId: string
  ): Promise<UserJourney | null> {
    const userJourney = await this.prismaService.userJourney.findUnique({
      where: { journeyId_userId: { journeyId: id, userId } }
    })

    if (userJourney != null && userJourney.openedAt == null) {
      const input = { openedAt: new Date() }
      return await this.prismaService.userJourney.update({
        where: { id: userJourney.id },
        data: input
      })
    }

    return userJourney
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
