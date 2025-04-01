import { Injectable } from '@nestjs/common'
import isNil from 'lodash/isNil'
import omitBy from 'lodash/omitBy'

import { Prisma } from '.prisma/api-journeys-client'

import {
  ButtonAction,
  Journey,
  JourneyEventsConnection,
  JourneyEventsFilter,
  MessagePlatform,
  VideoBlockSource,
  Visitor
} from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

@Injectable()
export class JourneyEventService {
  constructor(private readonly prismaService: PrismaService) {}

  generateWhere(
    journeyId: string,
    filter: JourneyEventsFilter,
    accessibleEvent: Prisma.EventWhereInput
  ): Prisma.EventWhereInput {
    return omitBy(
      {
        journeyId,
        createdAt: {
          gte: filter?.periodRangeStart ?? undefined,
          lte: filter?.periodRangeEnd ?? undefined
        },
        AND: [
          accessibleEvent,
          filter?.typenames != null
            ? {
                typename: { in: filter.typenames }
              }
            : undefined
        ].filter((element) => element)
      },
      isNil
    )
  }

  async getJourneyEvents({
    journeyId,
    accessibleEvent,
    filter,
    first,
    after
  }: {
    journeyId: string
    accessibleEvent: Prisma.EventWhereInput
    filter: JourneyEventsFilter
    first: number
    after?: string | null
  }): Promise<JourneyEventsConnection> {
    const where = this.generateWhere(journeyId, filter, accessibleEvent)

    const result = await this.prismaService.event.findMany({
      where,
      include: {
        journey: true,
        visitor: true
      },
      orderBy: { createdAt: 'desc' },
      cursor: after != null ? { id: after } : undefined,
      skip: after == null ? 0 : 1,
      take: first + 1
    })

    const sendResult = result.length > first ? result.slice(0, -1) : result
    return {
      edges: sendResult.map((event) => ({
        node: {
          id: event.id,
          journeyId: event.journeyId ?? '',
          createdAt: event.createdAt.toISOString(),
          label: event.label,
          value: event.value,
          typename: event.typename,
          visitorId: event.visitorId,
          action: event.action as ButtonAction,
          actionValue: event.actionValue,
          messagePlatform: event.messagePlatform as MessagePlatform,
          email: event.email,
          blockId: event.blockId,
          position: event.position,
          source: event.source as VideoBlockSource,
          progress: event.progress,
          journey: event.journey as unknown as Journey,
          visitor: event.visitor as unknown as Visitor
        },
        cursor: event.id
      })),
      pageInfo: {
        hasNextPage: result.length > first,
        // mocked in place to match sharable PageInfo type
        hasPreviousPage: false,
        startCursor: result.length > 0 ? result[0].id : null,
        endCursor:
          result.length > 0 ? sendResult[sendResult.length - 1].id : null
      }
    }
  }
}
