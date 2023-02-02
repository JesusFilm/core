import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { CurrentUser } from '@core/nest/decorators/CurrentUser'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { UserInputError } from 'apollo-server-errors'
import { User } from '@core/nest/common/firebaseClient'

import {
  IdType,
  Journey,
  UserInvite,
  UserInviteCreateInput,
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
    @CurrentUserId() senderId: string,
    @Args('journeyId') journeyId: string,
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

  async redeemInvite(
    userInvite: UserInvite,
    userId: string
  ): Promise<UserInvite> {
    // TODO: Get email from user in db when we can call api-users
    if (
      !userInvite.accepted &&
      new Date() < new Date(userInvite.expireAt as string)
    ) {
      const userJourney = await this.userJourneyResolver.userJourneyRequest(
        userInvite.journeyId,
        IdType.databaseId,
        userId
      )

      await this.userJourneyResolver.userJourneyApprove(
        userJourney.id,
        userInvite.senderId
      )

      const updatedInvite: UserInvite = await this.userInviteService.update(
        userInvite.id,
        {
          accepted: true
        }
      )

      return updatedInvite
    }

    return userInvite
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async userInviteAcceptAll(
    @CurrentUser() user: User
  ): Promise<Array<Promise<UserInvite>>> {
    const userInvites = await this.userInviteService.getAllUserInvitesByEmail(
      user.email
    )

    if (userInvites.length === 0) return []

    const invites = userInvites.map(
      async (userInvite) => await this.redeemInvite(userInvite, user.id)
    )

    return invites
  }
}
