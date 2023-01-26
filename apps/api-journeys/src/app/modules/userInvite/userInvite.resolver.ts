import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'

import {
  UserInvite,
  UserInviteCreateInput,
  UserInviteUpdateInput
} from '../../__generated__/graphql'
import { UserInviteService } from './userInvite.service'

@Resolver('UserInvite')
export class UserInviteResolver {
  constructor(private readonly userInviteService: UserInviteService) {}

  @Query()
  @UseGuards(GqlAuthGuard)
  async userInvite(@Args('id') id: string): Promise<UserInvite> {
    return await this.userInviteService.get(id)
  }

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
  async userInviteUpdate(
    @Args('id') id: string,
    @Args('input') input: UserInviteUpdateInput
  ): Promise<UserInvite> {
    const userInvite = await this.userInviteService.get<UserInvite>(id)

    return await this.userInviteService.update(userInvite.id, { ...input })
  }
}
