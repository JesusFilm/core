import {
  Resolver,
  Query,
  ResolveReference,
  Mutation,
  Args
} from '@nestjs/graphql'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { firebaseClient } from '@core/nest/common/firebaseClient'
import { UserUpdateInput, User } from '../../__generated__/graphql'
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

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async userUpdate(
    @CurrentUserId() userId: string,
    @Args('input') input: UserUpdateInput
  ): Promise<User | undefined> {
    const existingUser: User = await this.userService.getByUserId(userId)

    if (existingUser != null)
      return await this.userService.update(existingUser.id, input)

    return undefined
  }

  @ResolveReference()
  async resolveReference(reference: {
    __typename: string
    id: string
  }): Promise<User> {
    return await this.userService.getByUserId(reference.id)
  }
}
