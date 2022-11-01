// Block resolver tests are in individual block type spec files

import { Args, ResolveField, Resolver, Query } from '@nestjs/graphql'
import { Event, EventType, VisitorEvent } from '../../__generated__/graphql'
import { EventService } from './event.service'

interface DbEvent extends Event {
  __typename: string
}
@Resolver('Event')
export class EventResolver {
  constructor(private readonly eventService: EventService) {}

  @Query()
  async visitorEvents(
    @Args('visitorId') visitorId: string,
    @Args('eventTypes') eventTypes: [EventType]
  ): Promise<VisitorEvent[]> {
    const events = await this.eventService.getVisitorEvents(
      visitorId,
      eventTypes
    )
    return events
  }

  @ResolveField()
  __resolveType(obj: DbEvent): string {
    return obj.__typename
  }
}
