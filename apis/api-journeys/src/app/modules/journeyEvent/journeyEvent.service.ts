import { Injectable } from '@nestjs/common'
import isNil from 'lodash/isNil'
import omit from 'lodash/omit'
import omitBy from 'lodash/omitBy'

import { Prisma } from '@core/prisma/journeys/client'

import {
  ButtonAction,
  JourneyEventsConnection,
  JourneyEventsFilter,
  MessagePlatform,
  VideoBlockSource
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
      select: {
        id: true,
        journeyId: true,
        createdAt: true,
        label: true,
        value: true,
        typename: true,
        visitorId: true,
        action: true,
        actionValue: true,
        messagePlatform: true,
        email: true,
        blockId: true,
        position: true,
        source: true,
        progress: true,
        journey: {
          select: {
            id: true,
            slug: true
          }
        },
        visitor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
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
          ...omit(event, ['journey', 'visitor']),
          journeyId: event.journey?.id ?? journeyId,
          visitorId: event.visitor?.id ?? null,
          createdAt: event.createdAt.toISOString(),
          action: event.action as ButtonAction,
          messagePlatform: event.messagePlatform as MessagePlatform,
          source: event.source as VideoBlockSource,
          journeySlug: event.journey?.slug,
          visitorName: event.visitor?.name,
          visitorEmail: event.visitor?.email,
          visitorPhone: event.visitor?.phone
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

  async getJourneyEventsCount({
    journeyId,
    accessibleEvent,
    filter
  }: {
    journeyId: string
    accessibleEvent: Prisma.EventWhereInput
    filter: JourneyEventsFilter
  }): Promise<number> {
    const where = this.generateWhere(journeyId, filter, accessibleEvent)

    return await this.prismaService.event.count({ where })
  }
}
