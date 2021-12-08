import { Args, Resolver, Query } from '@nestjs/graphql'
import { UserJourneyService } from './userJourney.service'
import { KeyAsId } from '@core/nest/decorators'
import { User } from '../../graphql'

@Resolver('UserJourney')
export class UserJourneyResolver {
  constructor(private readonly userJourneyService: UserJourneyService) { }
  @Query()
  @KeyAsId()
  async userJourneys(): Promise<User[]> {
    return await this.userJourneyService.getAll()
  }

  @Query()
  @KeyAsId()
  async userJourney(@Args('id') _key: string): Promise<User> {
    return await this.userJourneyService.get(_key)
  }
}
