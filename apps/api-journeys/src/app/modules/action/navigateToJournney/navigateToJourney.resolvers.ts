import { Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { Journey, NavigateToJourneyAction } from '../../../__generated__/graphql'
import { KeyAsId } from '@core/nest/decorators'
import { JourneyService } from '../../journey/journey.service'

@Resolver('NavigateToJourneyAction')
export class NavigateToJourneyActionResolver {
  constructor(private readonly journeyService: JourneyService) { }
  @ResolveField()
  @KeyAsId()
  async journey(@Parent() action: NavigateToJourneyAction): Promise<Journey> {
    return await this.journeyService.get(action.journeyId)
  }
}