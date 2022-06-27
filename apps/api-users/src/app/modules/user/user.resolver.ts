import { Resolver, Query, ResolveReference } from '@nestjs/graphql'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { User } from '../../__generated__/graphql'
import { firebaseClient } from '../../lib/firebaseClient'
import { UserService } from './user.service'

@Resolver('User')
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query()
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUserId() userId: string): Promise<User> {
    const existingUser: User = await this.userService.getByUserId(userId)

    if (existingUser != null) return existingUser

    const {
      displayName,
      email,
      photoURL: imageUrl
    } = await firebaseClient.auth().getUser(userId)

    const firstName = displayName?.split(' ')?.slice(0, -1)?.join(' ') ?? ''
    const lastName = displayName?.split(' ')?.slice(-1)?.join(' ') ?? ''

    return await this.userService.save({
      userId,
      firstName,
      lastName,
      email,
      imageUrl
    })
  }

  @ResolveReference()
  async resolveReference(reference: {
    __typename: string
    id: string
  }): Promise<User> {
    return await this.userService.getByUserId(reference.id)
  }
}
