import { Args, Query, ResolveField, Resolver } from '@nestjs/graphql'

import {
  JourneyEventsConnection,
  JourneyEventsFilter
} from '../../__generated__/graphql'

import { EventService } from './event.service'

@Resolver('Event')
export class EventResolver {
  constructor(private readonly eventService: EventService) {}

  @Query()
  async journeyEventsConnection(
    @Args('journeyId') journeyId: string,
    @Args('where') filter: JourneyEventsFilter,
    @Args('first') first = 50,
    @Args('after') after?: string | null
  ): Promise<JourneyEventsConnection> {
    return await this.eventService.getJourneyEvents({
      journeyId,
      filter,
      first,
      after
    })
  }

  @ResolveField()
  __resolveType(obj: { __typename?: string; typename: string }): string {
    return obj.__typename ?? obj.typename
  }
}
