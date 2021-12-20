import { Args, Resolver, Query, ResolveField, Parent, Mutation } from '@nestjs/graphql'
import { UserService } from './user.service'
import { CurrentUserId, IdAsKey, KeyAsId } from '@core/nest/decorators'
import { User, UserCreateInput, UserJourney } from '../../__generated__/graphql'
import { UserJourneyService } from '../userJourney/userJourney.service'
import { UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'

@Resolver('User')
export class UserResolver {
  constructor(private readonly userService: UserService, private readonly userJourneyService: UserJourneyService) { }
  @Query()
  @KeyAsId()
  async users(): Promise<User[]> {
    return await this.userService.getAll()
  }

  @Query()
  @KeyAsId()
  async user(@Args('id') _key: string): Promise<User> {
    return await this.userService.get(_key)
  }

  @Query()
  @UseGuards(GqlAuthGuard)
  @KeyAsId()  
  async me(@CurrentUserId() userId: string): Promise<User> {
    return await this.userService.get(userId)
  }

  @ResolveField('usersJourneys')
  @KeyAsId()
  async usersJourneys(@Parent() user: User): Promise<UserJourney[]> {
    return await this.userJourneyService.forUser(user)
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  @IdAsKey()
  async userCreate(@Args('input') input: UserCreateInput): Promise<User> {
    return await this.userService.save(input)
  }
}
