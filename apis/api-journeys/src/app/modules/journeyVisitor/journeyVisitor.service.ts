import { Injectable } from '@nestjs/common'
import isNil from 'lodash/isNil'
import omitBy from 'lodash/omitBy'

import { JourneyVisitor, Prisma } from '@core/prisma/journeys/client'

import {
  JourneyVisitorFilter,
  JourneyVisitorSort,
  PageInfo
} from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

export interface JourneyVisitorsConnection {
  edges: Array<{
    node: JourneyVisitor
    cursor: string
  }>
  pageInfo: PageInfo
}

@Injectable()
export class JourneyVisitorService {
  constructor(private readonly prismaService: PrismaService) {}

  generateWhere(filter: JourneyVisitorFilter): Prisma.JourneyVisitorWhereInput {
    return omitBy(
      {
        journeyId: filter.journeyId,
        lastChatStartedAt:
          filter?.hasChatStarted === true ? { not: null } : undefined,
        lastRadioQuestion:
          filter?.hasPollAnswers === true ? { not: null } : undefined,
        lastTextResponse:
          filter?.hasTextResponse === true ? { not: null } : undefined,
        activityCount: filter?.hideInactive === true ? { gt: 0 } : undefined,
        visitor:
          filter?.hasIcon === true || filter?.countryCode != null
            ? omitBy(
                {
                  status: filter?.hasIcon === true ? { not: null } : undefined,
                  countryCode:
                    filter?.countryCode != null
                      ? { contains: filter.countryCode }
                      : undefined
                },
                isNil
              )
            : undefined
      },
      isNil
    )
  }

  async getJourneyVisitorList({
    after,
    first,
    filter,
    sort
  }: {
    after?: string | null
    first: number
    filter: Prisma.JourneyVisitorWhereInput
    sort?: JourneyVisitorSort
  }): Promise<JourneyVisitorsConnection> {
    const result = await this.prismaService.journeyVisitor.findMany({
      where: filter,
      cursor: after != null ? { id: after } : undefined,
      orderBy: omitBy(
        {
          createdAt: sort === JourneyVisitorSort.date ? 'desc' : undefined,
          activityCount:
            sort === JourneyVisitorSort.activity ? 'desc' : undefined,
          duration: sort === JourneyVisitorSort.duration ? 'desc' : undefined
        },
        isNil
      ),
      skip: after == null ? 0 : 1,
      take: first + 1
    })

    const sendResult = result.length > first ? result.slice(0, -1) : result
    return {
      edges: sendResult.map((visitor) => ({
        node: visitor,
        cursor: visitor.id
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

  async getJourneyVisitorCount(
    filter: Prisma.JourneyVisitorWhereInput
  ): Promise<number> {
    return await this.prismaService.journeyVisitor.count({
      where: filter
    })
  }
}
