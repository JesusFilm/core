import { Injectable } from '@nestjs/common'

import { JourneyVisitor, Prisma, Visitor } from '@core/prisma/journeys/client'

import { PageInfo } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'
import { ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED } from '../../lib/prismaErrors'

interface ListParams {
  after?: string | null
  first: number
  filter: Prisma.VisitorWhereInput
  sortOrder?: 'ASC' | 'DESC'
}

export interface VisitorsConnection {
  edges: Array<{
    node: Visitor
    cursor: string
  }>
  pageInfo: PageInfo
}

@Injectable()
export class VisitorService {
  constructor(private readonly prismaService: PrismaService) {}

  async getList({
    after,
    first,
    filter
  }: ListParams): Promise<VisitorsConnection> {
    const result = await this.prismaService.visitor.findMany({
      where: { teamId: filter.teamId },
      cursor: after != null ? { id: after } : undefined,
      orderBy: { createdAt: 'desc' },
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

  async getByUserIdAndJourneyId(
    userId: string,
    journeyId: string
  ): Promise<
    | {
        visitor: Visitor
        journeyVisitor: JourneyVisitor
      }
    | undefined
  > {
    const journey = await this.prismaService.journey.findUnique({
      where: {
        id: journeyId
      }
    })

    if (journey == null) throw new Error('Journey not found')

    let retry = true
    while (retry) {
      try {
        const visitor = await this.prismaService.visitor.upsert({
          where: {
            teamId_userId: {
              teamId: journey.teamId,
              userId
            }
          },
          create: {
            teamId: journey.teamId,
            userId
          },
          update: {}
        })
        const journeyVisitor = await this.prismaService.journeyVisitor.upsert({
          where: {
            journeyId_visitorId: {
              journeyId,
              visitorId: visitor.id
            }
          },
          create: {
            journeyId,
            visitorId: visitor.id
          },
          update: {}
        })

        retry = false
        return { visitor, journeyVisitor }
      } catch (err) {
        if (
          !(err instanceof Prisma.PrismaClientKnownRequestError) ||
          err.code !== ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED
        ) {
          retry = false
          throw err
        }
      }
    }
  }

  async update(id: string, data: Partial<Visitor>): Promise<Visitor> {
    return await this.prismaService.visitor.update({
      where: { id },
      data: {
        ...data,
        createdAt:
          data.createdAt != null ? new Date(data.createdAt) : undefined,
        userAgent: data.userAgent ?? undefined
      }
    })
  }
}
