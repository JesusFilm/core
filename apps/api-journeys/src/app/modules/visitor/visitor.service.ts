import { Injectable } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'
import { Visitor, JourneyVisitor, Prisma } from '.prisma/api-journeys-client'
import {
  PageInfo,
  JourneyVisitorFilter,
  JourneyVisitorSort
} from '../../__generated__/graphql'
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
    cursor: Date
  }>
  pageInfo: PageInfo
}

export interface JourneyVisitorsConnection {
  edges: Array<{
    node: JourneyVisitor
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
      cursor: after != null ? { createdAt: new Date(after) } : undefined,
      orderBy: { createdAt: 'desc' },
      skip: after == null ? 0 : 1,
      take: first + 1
    })

    const sendResult = result.length > first ? result.slice(0, -1) : result
    return {
      edges: sendResult.map((visitor) => ({
        node: visitor,
        cursor: visitor.createdAt
      })),
      pageInfo: {
        hasNextPage: result.length > first,
        startCursor:
          result.length > 0 ? result[0].createdAt.toISOString() : null,
        endCursor:
          result.length > 0
            ? sendResult[sendResult.length - 1].createdAt.toISOString()
            : null
      }
    }
  }

  generateWhere(
    filter?: JourneyVisitorFilter
  ): Prisma.JourneyVisitorWhereInput {
    return {
      journeyId: filter?.journeyId ?? undefined,
      lastChatStartedAt:
        filter?.hasChatStarted === true ? { not: null } : undefined,
      lastRadioQuestion:
        filter?.hasPollAnswers === true ? { not: null } : undefined,
      lastTextResponse:
        filter?.hasTextResponse === true ? { not: null } : undefined,
      activityCount: filter?.hideInactive === true ? { gt: 0 } : undefined,
      visitor: {
        status: filter?.hasIcon === true ? { not: null } : undefined,
        countryCode:
          filter?.countryCode != null
            ? { contains: filter.countryCode }
            : undefined
      }
    }
  }

  async getJourneyVisitorList({
    after,
    first,
    filter,
    sort
  }: {
    after?: string | null
    first: number
    filter: JourneyVisitorFilter
    sort?: JourneyVisitorSort
  }): Promise<JourneyVisitorsConnection> {
    const result = await this.prismaService.journeyVisitor.findMany({
      where: this.generateWhere(filter),
      cursor: after != null ? { id: after } : undefined,
      orderBy: {
        createdAt: sort === JourneyVisitorSort.date ? 'desc' : undefined,
        activityCount:
          sort === JourneyVisitorSort.activity ? 'desc' : undefined,
        duration: sort === JourneyVisitorSort.duration ? 'desc' : undefined
      },
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

  async getJourneyVisitorCount(filter: JourneyVisitorFilter): Promise<number> {
    return await this.prismaService.journeyVisitor.count({
      where: this.generateWhere(filter)
    })
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
    const journeyVisitor = await this.prismaService.journeyVisitor.upsert({
      where: { journeyId_visitorId: { journeyId, visitorId: visitor.id } },
      update: {},
      create: {
        journeyId,
        visitorId: visitor.id
      }
    })

    return { visitor, journeyVisitor }
  }
}
