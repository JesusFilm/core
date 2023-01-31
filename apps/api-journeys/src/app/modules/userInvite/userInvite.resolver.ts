import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { UserInputError } from 'apollo-server-errors'

import {
  IdType,
  Journey,
  UserInvite,
  UserInviteCreateInput,
  UserInviteAcceptInput,
  UserJourneyRole
} from '../../__generated__/graphql'
import { UserJourneyResolver } from '../userJourney/userJourney.resolver'
import { RoleGuard } from '../../lib/roleGuard/roleGuard'
import { JourneyService } from '../journey/journey.service'
import { UserInviteService } from './userInvite.service'

@Resolver('UserInvite')
export class UserInviteResolver {
  constructor(
    private readonly userInviteService: UserInviteService,
    private readonly userJourneyResolver: UserJourneyResolver,
    private readonly journeyService: JourneyService
  ) {}

  @Query()
  @UseGuards(
    GqlAuthGuard,
    RoleGuard('journeyId', [UserJourneyRole.owner, UserJourneyRole.editor])
  )
  async userInvites(
    @Args('journeyId') journeyId: string
  ): Promise<UserInvite[]> {
    return await this.userInviteService.getAllUserInvitesByJourney(journeyId)
  }

  @Mutation()
  @UseGuards(
    GqlAuthGuard,
    RoleGuard('journeyId', [UserJourneyRole.owner, UserJourneyRole.editor])
  )
  async userInviteCreate(
    @Args('journeyId') journeyId: string,
    @CurrentUserId() senderId: string,
    @Args('input') input: UserInviteCreateInput
  ): Promise<UserInvite> {
    const journey = await this.journeyService.get<Journey>(journeyId)

    if (journey == null) throw new UserInputError('journey does not exist')

    const currentDate = new Date()
    const expireAt = new Date(
      currentDate.setDate(currentDate.getDate() + 30)
    ).toISOString()

    return await this.userInviteService.save({
      journeyId: journey.id,
      senderId,
      email: input.email,
      accepted: false,
      expireAt
    })
  }

  @Mutation()
  @UseGuards(
    GqlAuthGuard,
    RoleGuard('journeyId', [UserJourneyRole.owner, UserJourneyRole.editor])
  )
  async userInviteRemove(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string
  ): Promise<UserInvite> {
    return await this.userInviteService.remove(id)
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async userInviteAccept(
    @Args('journeyId') journeyId: string,
    @CurrentUserId() userId: string,
    @Args('input') input: UserInviteAcceptInput
  ): Promise<UserInvite | null> {
    const userInvite =
      await this.userInviteService.getUserInviteByJourneyAndEmail(
        journeyId,
        input.email
      )

    if (userInvite == null) return null

    // TODO: Get email from user in db when we can call api-users
    if (!userInvite.accepted && new Date() < new Date(userInvite.expireAt)) {
      const userJourney = await this.userJourneyResolver.userJourneyRequest(
        userInvite.journeyId,
        IdType.databaseId,
        userId
      )

      await this.userJourneyResolver.userJourneyApprove(
        userJourney.id,
        userInvite.senderId
      )

      return await this.userInviteService.update(userInvite.id, {
        accepted: true
      })
    }

    return userInvite
  }
}
