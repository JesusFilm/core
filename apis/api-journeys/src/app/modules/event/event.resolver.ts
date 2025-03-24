import { UseGuards } from '@nestjs/common'
import { Args, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { Prisma } from '.prisma/api-journeys-client'
import { CaslAccessible } from '@core/nest/common/CaslAuthModule'

import {
  JourneyEventsConnection,
  JourneyEventsFilter
} from '../../__generated__/graphql'
import { AppCaslGuard } from '../../lib/casl/caslGuard'

import { EventService } from './event.service'

@Resolver('Event')
export class EventResolver {
  constructor(private readonly eventService: EventService) {}

  @Query()
  @UseGuards(AppCaslGuard)
  async journeyEventsConnection(
    @CaslAccessible('Event')
    accessibleEvent: Prisma.EventWhereInput,
    @Args('journeyId') journeyId: string,
    @Args('filter') filter: JourneyEventsFilter,
    @Args('first') first = 50,
    @Args('after') after?: string | null
  ): Promise<JourneyEventsConnection> {
    return await this.eventService.getJourneyEvents({
      journeyId,
      accessibleEvent,
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
