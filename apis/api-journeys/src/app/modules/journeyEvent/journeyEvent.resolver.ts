import { UseGuards } from '@nestjs/common'
import { Args, Query, Resolver } from '@nestjs/graphql'

import { CaslAccessible } from '@core/nest/common/CaslAuthModule'
import { Prisma } from '@core/prisma/journeys/client'

import {
  JourneyEventsConnection,
  JourneyEventsFilter
} from '../../__generated__/graphql'
import { AppCaslGuard } from '../../lib/casl/caslGuard'

import { JourneyEventService } from './journeyEvent.service'

@Resolver('JourneyEvent')
export class JourneyEventResolver {
  constructor(private readonly journeyEventService: JourneyEventService) {}

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
    return await this.journeyEventService.getJourneyEvents({
      journeyId,
      accessibleEvent,
      filter,
      first,
      after
    })
  }

  @Query()
  @UseGuards(AppCaslGuard)
  async journeyEventsCount(
    @CaslAccessible('Event')
    accessibleEvent: Prisma.EventWhereInput,
    @Args('journeyId') journeyId: string,
    @Args('filter') filter: JourneyEventsFilter
  ) {
    return await this.journeyEventService.getJourneyEventsCount({
      journeyId,
      accessibleEvent,
      filter
    })
  }
}
