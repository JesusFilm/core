import { Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { Journey, NavigateToJourneyAction } from '../../../graphql'
import { KeyAsId } from '../../../lib/decorators'
import { JourneyService } from '../../journey/journey.service'

@Resolver('NavigateToJourneyAction')
export class NavigateToJourneyActionResolver {
  constructor(private readonly journeyservice: JourneyService) { }
  @ResolveField()
  @KeyAsId()
  async journey(@Parent() action: NavigateToJourneyAction): Promise<Journey> {
    return await this.journeyservice.get(action.journeyId)
  }
}