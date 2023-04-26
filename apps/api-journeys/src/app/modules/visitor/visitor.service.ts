import { Inject, Injectable } from '@nestjs/common'
import { KeyAsId } from '@core/nest/decorators/KeyAsId'
import { v4 as uuidv4 } from 'uuid'
import { Visitor } from '.prisma/api-journeys-client'
import { MessagePlatform, PageInfo } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'
import { JourneyService } from '../journey/journey.service'

interface ListParams {
  after?: string | null
  first: number
  filter: {
    teamId: string | undefined
  }
  sortOrder?: 'ASC' | 'DESC'
}

export interface VisitorRecord {
  id: string
  teamId: string
  userId: string
  createdAt: string
  lastStepViewedAt?: string
  userAgent?: string
  messagePlatform?: MessagePlatform
  name?: string
  email?: string
  lastChatStartedAt?: string
  lastChatPlatform?: MessagePlatform
  lastTextResponse?: string
  lastRadioQuestion?: string
  lastRadioOptionSubmission?: string
  lastLinkAction?: string
}

export interface VisitorsConnection {
  results: Visitor[]
  pageInfo: PageInfo
}

@Injectable()
export class VisitorService {
  constructor(
    @Inject(PrismaService) private readonly prismaService: PrismaService,
    private readonly journeyService: JourneyService
  ) {}

  @KeyAsId()
  async getList({
    after,
    first,
    filter
  }: ListParams): Promise<VisitorsConnection> {
    const result = await this.prismaService.visitor.findMany({
      where: filter,
      cursor: {
        createdAt: after != null ? new Date(after) : undefined
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: after == null ? 0 : 1,
      take: first + 1
    })
    const sendResult = result.length > first ? result.slice(0, -1) : result
    return {
      results: sendResult,
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

  async getByUserIdAndJourneyId(
    userId: string,
    journeyId: string
  ): Promise<Visitor> {
    const journey = await this.journeyService.get(journeyId)

    let visitor = await this.prismaService.visitor.findFirst({
      where: { userId, teamId: journey.teamId }
    })

    if (visitor == null) {
      const id = uuidv4()
      const createdAt = new Date().toISOString()
      visitor = await this.prismaService.visitor.create({
        data: {
          id,
          teamId: journey.teamId,
          userId,
          createdAt
        }
      })
    }

    return visitor
  }

  async update(id: string, data: Partial<VisitorRecord>): Promise<Visitor> {
    return await this.prismaService.visitor.update({
      where: { id },
      data
    })
  }
}
