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
import { AuthenticationError, UserInputError } from 'apollo-server-errors'
import {
  IdType,
  Journey,
  Role,
  UserJourneyRole
} from '../../__generated__/graphql'
import { JourneyService } from '../journey/journey.service'
import { RoleGuard } from '../../lib/roleGuard/roleGuard'
import { UserJourneyRecord, UserJourneyService } from './userJourney.service'

@Resolver('UserJourney')
export class UserJourneyResolver {
  constructor(
    private readonly userJourneyService: UserJourneyService,
    private readonly journeyService: JourneyService
  ) {}

  @Query()
  async userJourneys(@Parent() journey: Journey): Promise<UserJourneyRecord[]> {
    return await this.userJourneyService.forJourney(journey)
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async userJourneyRequest(
    @Args('journeyId') journeyId: string,
    @Args('idType') idType: IdType = IdType.slug,
    @CurrentUserId() userId: string
  ): Promise<UserJourneyRecord | undefined> {
    return await this.userJourneyService.requestAccess(
      journeyId,
      idType,
      userId
    )
  }

  async checkOwnership(id: string, userId: string): Promise<UserJourneyRecord> {
    // can only update user journey roles if you are the journey's owner.
    const actor = await this.userJourneyService.forJourneyUser(id, userId)

    if (actor?.role !== UserJourneyRole.owner)
      throw new AuthenticationError(
        'You do not own this journey, so you cannot make changes to it'
      )

    return actor
  }

  async getUserJourney(id: string): Promise<UserJourneyRecord | undefined> {
    const userJourney = await this.userJourneyService.get(id)
    if (userJourney === null) throw new UserInputError('User journey not found')
    return userJourney
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async userJourneyApprove(
    @Args('id') id: string,
    @CurrentUserId() userId: string
  ): Promise<UserJourneyRecord | undefined> {
    return await this.userJourneyService.approveAccess(id, userId)
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async userJourneyPromote(
    @Args('id') id: string,
    @CurrentUserId() userId: string
  ): Promise<UserJourneyRecord | undefined> {
    const userJourney = await this.getUserJourney(id)

    if (userJourney == null)
      throw new UserInputError('userJourney does not exist')

    const actor = await this.checkOwnership(userJourney.journeyId, userId)
    if (actor.userId === userJourney.userId) return actor

    const newOwner = await this.userJourneyService.update(id, {
      role: UserJourneyRole.owner
    })

    await this.userJourneyService.update(actor.id, {
      role: UserJourneyRole.editor
    })

    return newOwner
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async userJourneyRemove(
    @Args('id') id: string,
    @CurrentUserId() userId: string
  ): Promise<UserJourneyRecord | undefined> {
    const userJourney = await this.getUserJourney(id)

    if (userJourney == null)
      throw new UserInputError('userJourney does not exist')

    if (userJourney.role !== UserJourneyRole.inviteRequested) {
      await this.checkOwnership(userJourney.journeyId, userId)
    }

    return await this.userJourneyService.remove(id)
  }

  @Mutation()
  @UseGuards(
    GqlAuthGuard,
    RoleGuard('id', { role: Role.publisher, attributes: { template: true } })
  )
  async userJourneyRemoveAll(
    @Args('id') id: string
  ): Promise<Array<UserJourneyRecord | undefined>> {
    const journey: Journey = await this.journeyService.get(id)
    const userJourneys = await this.userJourneyService.forJourney(journey)
    const userJourneyIds: string[] = userJourneys.map(
      (userJourney) => userJourney.id
    )

    return await this.userJourneyService.removeAll(userJourneyIds)
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async userJourneyOpen(
    @Args('id') id: string,
    @CurrentUserId() userId: string
  ): Promise<UserJourneyRecord | undefined> {
    const userJourney = await this.userJourneyService.forJourneyUser(id, userId)

    if (userJourney != null && userJourney.openedAt == null) {
      const input = { openedAt: new Date().toISOString() }
      return await this.userJourneyService.update(userJourney.id, input)
    }
  }

  @ResolveField()
  async journey(@Parent() userJourney: UserJourneyRecord): Promise<Journey> {
    return await this.journeyService.get(userJourney.journeyId)
  }

  @ResolveField('user')
  async user(
    @Parent() userJourney: UserJourneyRecord
  ): Promise<{ __typename: string; id: string }> {
    return { __typename: 'User', id: userJourney.userId }
  }
}
