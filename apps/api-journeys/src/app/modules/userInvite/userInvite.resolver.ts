import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { v4 as uuidv4 } from 'uuid'

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
  async userInvites(userId: string): Promise<UserInvite[]> {
    return await this.userInviteService.getAllUserInvitesBySender(userId)
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async userInviteCreate(
    @Args('journeyId') journeyId: string,
    @Args('input') input: UserInviteCreateInput
  ): Promise<UserInvite | null> {
    const inviteId = uuidv4()
    const currentDate = new Date()
    const expireAt = currentDate.setDate(currentDate.getDate() + 30)

    return await this.userInviteService.save({
      inviteId,
      journeyId,
      sentBy: input.sentBy,
      name: input.name,
      email: input.email,
      acceptedBy: null,
      expireAt: new Date(expireAt).toISOString()
    })
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async userInviteUpdate(
    @Args('id') id: string,
    @Args('input') input: UserInviteUpdateInput
  ): Promise<UserInvite> {
    const userInvite = await this.userInviteService.getUserInviteByInviteId(id)

    return await this.userInviteService.update(userInvite.id, { ...input })
  }
}
