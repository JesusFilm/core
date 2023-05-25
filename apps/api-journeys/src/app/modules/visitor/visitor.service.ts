import { Injectable } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'
import { Visitor, JourneyVisitor } from '.prisma/api-journeys-client'
import { PageInfo } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'
import { JourneyService } from '../journey/journey.service'

interface ListParams {
  after?: string | null
  first: number
  filter: {
    teamId: string
  }
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
  constructor(
    private readonly prismaService: PrismaService,
    private readonly journeyService: JourneyService
  ) {}

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
        startCursor: result.length > 0 ? result[0].id : null,
        endCursor:
          result.length > 0 ? sendResult[sendResult.length - 1].id : null
      }
    }
  }

  async getByUserIdAndJourneyId(
    userId: string,
    journeyId: string
  ): Promise<{
    visitor: Visitor
    journeyVisitor: JourneyVisitor
  }> {
    const journey = await this.journeyService.get(journeyId)
    if (journey == null) throw new Error('Journey not found')

    let visitor = await this.prismaService.visitor.findFirst({
      where: { userId, teamId: journey.teamId }
    })

    if (visitor == null) {
      const id = uuidv4()
      const createdAt = new Date()
      visitor = await this.prismaService.visitor.create({
        data: {
          id,
          teamId: journey.teamId,
          userId,
          createdAt
        }
      })
    }
    let journeyVisitor = await this.prismaService.journeyVisitor.findUnique({
      where: { journeyId_visitorId: { journeyId, visitorId: visitor.id } }
    })
    if (journeyVisitor == null) {
      journeyVisitor = await this.prismaService.journeyVisitor.create({
        data: {
          journeyId,
          visitorId: visitor.id
        }
      })
    }

    return { visitor, journeyVisitor }
  }
}
