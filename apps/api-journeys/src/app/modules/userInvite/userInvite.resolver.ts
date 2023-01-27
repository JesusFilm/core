import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'

import { UserInvite, UserInviteCreateInput } from '../../__generated__/graphql'
import { UserJourneyResolver } from '../userJourney/userJourney.resolver'
import { UserInviteService } from './userInvite.service'

@Resolver('UserInvite')
export class UserInviteResolver {
  constructor(
    private readonly userInviteService: UserInviteService,
    private readonly userJourneyResolver: UserJourneyResolver
  ) {}

  // Possibly add RoleGuard here. Add or remove comment after UX reply
  @Query()
  @UseGuards(GqlAuthGuard)
  async userInvites(
    @Args('journeyId') journeyId: string
  ): Promise<UserInvite[]> {
    return await this.userInviteService.getAllUserInvitesByJourney(journeyId)
  }

  // Possibly add RoleGuard here. Add or remove comment after UX reply
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async userInviteCreate(
    @Args('journeyId') journeyId: string,
    @Args('input') input: UserInviteCreateInput
  ): Promise<UserInvite | null> {
    const currentDate = new Date()
    const expireAt = currentDate.setDate(currentDate.getDate() + 30)

    return await this.userInviteService.save({
      journeyId,
      name: input.name,
      email: input.email,
      accepted: false,
      expireAt: new Date(expireAt).toISOString()
    })
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async userInviteAccept(
    @Args('id') id: string,
    @CurrentUserId() userId: string
  ): Promise<UserInvite> {
    const { journeyId } = await this.userInviteService.get<UserInvite>(id)

    const userJourney = await this.userJourneyResolver.userJourneyRequest(
      journeyId,
      undefined,
      userId
    )

    await this.userJourneyResolver.userJourneyApprove(userJourney.id, userId)

    return await this.userInviteService.update(id, { accepted: true })
  }
}
