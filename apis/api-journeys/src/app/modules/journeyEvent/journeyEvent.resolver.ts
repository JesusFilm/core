import { UseGuards } from '@nestjs/common'
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { Journey, Prisma, Visitor } from '.prisma/api-journeys-client'
import { CaslAccessible } from '@core/nest/common/CaslAuthModule'

import {
  JourneyEventsConnection,
  JourneyEventsFilter
} from '../../__generated__/graphql'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { PrismaService } from '../../lib/prisma.service'

import { JourneyEventService } from './journeyEvent.service'

@Resolver('JourneyEvent')
export class JourneyEventResolver {
  constructor(
    private readonly journeyEventService: JourneyEventService,
    private readonly prismaService: PrismaService
  ) {}

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

  @ResolveField()
  __resolveType(obj: { __typename?: string; typename: string }): string {
    return obj.__typename ?? obj.typename
  }

  @ResolveField()
  async journey(@Parent() event): Promise<Journey | null> {
    return this.prismaService.journey.findUnique({
      where: { id: event.journeyId }
    })
  }

  @ResolveField()
  async visitor(@Parent() journeyEvent): Promise<Visitor | null> {
    return await this.prismaService.visitor.findUnique({
      where: { id: journeyEvent.visitorId }
    })
  }
}
