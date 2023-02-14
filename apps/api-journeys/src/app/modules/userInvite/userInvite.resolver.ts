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
import { RoleGuard } from '../../lib/roleGuard/roleGuard'
import { JourneyService } from '../journey/journey.service'
import { UserJourneyService } from '../userJourney/userJourney.service'
import { UserInviteService } from './userInvite.service'

@Resolver('UserInvite')
export class UserInviteResolver {
  constructor(
    private readonly userInviteService: UserInviteService,
    private readonly userJourneyService: UserJourneyService,
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
  ): Promise<UserInvite | null> {
    const userInvite: UserInvite =
      await this.userInviteService.getUserInviteByJourneyAndEmail(
        journeyId,
        input.email
      )

    // Create invite if doesn't exist.
    if (userInvite == null) {
      const journey: Journey = await this.journeyService.get(journeyId)

      if (journey == null) throw new UserInputError('journey does not exist')

      return await this.userInviteService.save({
        journeyId: journey.id,
        senderId,
        email: input.email,
        acceptedAt: null,
        removedAt: null
      })
    }

    // Else re-activate removed invite
    if (userInvite.removedAt != null) {
      return await this.userInviteService.update(userInvite.id, {
        senderId,
        acceptedAt: null,
        removedAt: null
      })
    }

    return null
  }

  @Mutation()
  @UseGuards(
    GqlAuthGuard,
    RoleGuard('journeyId', [UserJourneyRole.owner, UserJourneyRole.editor])
  )
  async userInviteRemove(
    @Args('id') id: string,
    // journeyId needed for RoleGuard
    @Args('journeyId') journeyId: string
  ): Promise<UserInvite> {
    return await this.userInviteService.update(id, {
      // Remove called on pending invites and on deleting userJourneys. Both need to reset acceptedAt.
      acceptedAt: null,
      removedAt: new Date().toISOString()
    })
  }

  async redeemInvite(
    userInvite: UserInvite,
    userId: string
  ): Promise<UserInvite> {
    // Create userJourney for new invites
    if (userInvite.removedAt == null) {
      const userJourney = await this.userJourneyService.requestAccess(
        userInvite.journeyId,
        IdType.databaseId,
        userId
      )

      // User already has access to journey, remove invalid invite
      if (userJourney == null) {
        return await this.userInviteService.update(userInvite.id, {
          removedAt: new Date().toISOString()
        })
      }

      await this.userJourneyService.approveAccess(
        userJourney.id,
        userInvite.senderId
      )

      return await this.userInviteService.update(userInvite.id, {
        acceptedAt: new Date().toISOString()
      })
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
