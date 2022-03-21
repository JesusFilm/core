import {
  Args,
  Resolver,
  Mutation,
  Parent,
  Query,
  ResolveField
} from '@nestjs/graphql'
import { CurrentUserId } from '@core/nest/decorators'
import { UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'
import { AuthenticationError, UserInputError } from 'apollo-server-errors'
import {
  IdType,
  Journey,
  UserJourney,
  UserJourneyRole
} from '../../__generated__/graphql'
import { JourneyService } from '../journey/journey.service'
import { UserJourneyService } from './userJourney.service'

@Resolver('UserJourney')
export class UserJourneyResolver {
  constructor(
    private readonly userJourneyService: UserJourneyService,
    private readonly journeyService: JourneyService
  ) {}

  @Query()
  async userJourneys(@Parent() journey: Journey): Promise<UserJourney[]> {
    return await this.userJourneyService.forJourney(journey)
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async userJourneyRequest(
    @Args('journeyId') journeyId: string,
    @Args('idType') idType: IdType = IdType.slug,
    @CurrentUserId() userId: string
  ): Promise<UserJourney> {
    const journey: Journey =
      idType === IdType.slug
        ? await this.journeyService.getBySlug(journeyId)
        : await this.journeyService.get(journeyId)

    if (journey == null) throw new UserInputError('journey does not exist')

    return await this.userJourneyService.save({
      userId,
      journeyId: journey.id,
      role: 'inviteRequested'
    })
  }

  async checkOwnership(id: string, userId: string): Promise<UserJourney> {
    // can only update user journey roles if you are the journey's owner.
    const actor: UserJourney = await this.userJourneyService.forJourneyUser(
      id,
      userId
    )

    if (actor?.role !== UserJourneyRole.owner)
      throw new AuthenticationError(
        'You do not own this journey, so you cannot make changes to it'
      )

    return actor
  }

  async getUserJourney(id: string): Promise<UserJourney> {
    const userJourney: UserJourney = await this.userJourneyService.get(id)
    if (userJourney === null) throw new UserInputError('User journey not found')
    return userJourney
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async userJourneyApprove(
    @Args('id') id: string,
    @CurrentUserId() userId: string
  ): Promise<UserJourney> {
    const userJourney: UserJourney = await this.getUserJourney(id)
    await this.checkOwnership(userJourney.journeyId, userId)
    return await this.userJourneyService.update(id, {
      role: UserJourneyRole.editor
    })
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async userJourneyPromote(
    @Args('id') id: string,
    @CurrentUserId() userId: string
  ): Promise<UserJourney> {
    const userJourney: UserJourney = await this.getUserJourney(id)
    const actor: UserJourney = await this.checkOwnership(
      userJourney.journeyId,
      userId
    )
    if (actor.userId === userJourney.userId) return actor

    const newOwner: UserJourney = await this.userJourneyService.update(id, {
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
  ): Promise<UserJourney> {
    const userJourney: UserJourney = await this.getUserJourney(id)
    await this.checkOwnership(userJourney.journeyId, userId)
    return await this.userJourneyService.remove(id)
  }

  @ResolveField()
  async journey(@Parent() userJourney: UserJourney): Promise<Journey> {
    return await this.journeyService.get(userJourney.journeyId)
  }

  @ResolveField('user')
  async user(
    @Parent() userJourney: UserJourney
  ): Promise<{ __typename: string; id: string }> {
    return { __typename: 'User', id: userJourney.userId }
  }
}
