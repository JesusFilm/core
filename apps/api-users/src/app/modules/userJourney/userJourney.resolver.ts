import { Args, Resolver, Mutation } from '@nestjs/graphql'
import { UserJourneyService } from './userJourney.service'
import { IdAsKey } from '@core/nest/decorators'
import { UserJourney, UserJourneyCreateInput, UserJourneyUpdateInput } from '../../__generated__/graphql'
import { UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'

@Resolver('UserJourney')
export class UserJourneyResolver {
  constructor(private readonly userJourneyService: UserJourneyService) { }
  @Mutation()
  @UseGuards(GqlAuthGuard)
  @IdAsKey()
  async userJourneyCreate(@Args('input') input: UserJourneyCreateInput): Promise<UserJourney> {
    return await this.userJourneyService.save(input)
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async userJourneyUpdate(@Args('id') id: string, @Args('input') input: UserJourneyUpdateInput): Promise<UserJourney> {
    return await this.userJourneyService.update(id, input)
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async userJourneyRemove(@Args('id') id: string): Promise<UserJourney> {
    return await this.userJourneyService.remove(id)
  }
}
