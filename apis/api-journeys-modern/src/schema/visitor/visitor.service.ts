import isNil from 'lodash/isNil'
import omitBy from 'lodash/omitBy'

import { Prisma } from '.prisma/api-journeys-modern-client'

import { prisma } from '../../lib/prisma'

interface JourneyVisitorFilter {
  journeyId: string
  hasChatStarted?: boolean | null
  hasPollAnswers?: boolean | null
  hasTextResponse?: boolean | null
  hasIcon?: boolean | null
  hideInactive?: boolean | null
  countryCode?: string | null
}

export enum JourneyVisitorSort {
  date = 'date',
  duration = 'duration',
  activity = 'activity'
}

interface PageInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor?: string | null
  endCursor?: string | null
}

interface JourneyVisitorsConnection {
  edges: Array<{
    node: any
    cursor: string
  }>
  pageInfo: PageInfo
}

export class VisitorService {
  generateJourneyVisitorWhere(
    filter: JourneyVisitorFilter
  ): Prisma.JourneyVisitorWhereInput {
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
    first = 50,
    filter,
    sort
  }: {
    after?: string | null
    first?: number
    filter: Prisma.JourneyVisitorWhereInput
    sort?: JourneyVisitorSort
  }): Promise<JourneyVisitorsConnection> {
    const result = await prisma.journeyVisitor.findMany({
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
        hasPreviousPage: false, // Simplified for compatibility
        startCursor: result.length > 0 ? result[0].id : null,
        endCursor:
          result.length > 0 ? sendResult[sendResult.length - 1].id : null
      }
    }
  }

  async getJourneyVisitorCount(
    filter: Prisma.JourneyVisitorWhereInput
  ): Promise<number> {
    return await prisma.journeyVisitor.count({
      where: filter
    })
  }
}
