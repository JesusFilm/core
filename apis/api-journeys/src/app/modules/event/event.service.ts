import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'
import { GraphQLError } from 'graphql'
import isNil from 'lodash/isNil'
import omitBy from 'lodash/omitBy'

import {
  Block,
  JourneyVisitor,
  Prisma,
  Visitor
} from '.prisma/api-journeys-client'
import { FromPostgresql } from '@core/nest/decorators/FromPostgresql'
import { EventsNotificationJob } from '@core/yoga/emailEvents/types'

import {
  JourneyEventsConnection,
  JourneyEventsFilter
} from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'
import { BlockService } from '../block/block.service'
import { VisitorService } from '../visitor/visitor.service'

const TWO_MINUTES = 2 * 60 * 1000 // in milliseconds
export const ONE_DAY = 24 * 60 * 60 // in seconds

@Injectable()
export class EventService {
  constructor(
    @InjectQueue('api-journeys-events-email')
    private readonly emailQueue: Queue<EventsNotificationJob>,
    private readonly prismaService: PrismaService,
    private readonly blockService: BlockService,
    private readonly visitorService: VisitorService
  ) {}

  async validateBlockEvent(
    userId: string,
    blockId: string,
    stepId: string | null = null
  ): Promise<{
    visitor: Visitor
    journeyVisitor: JourneyVisitor
    journeyId: string
    block: Block
  }> {
    const block = await this.prismaService.block.findUnique({
      where: { id: blockId },
      include: { action: true }
    })

    if (block == null) {
      throw new GraphQLError('Block does not exist', {
        extensions: { code: 'NOT_FOUND' }
      })
    }
    const journeyId = block.journeyId

    const visitorAndJourneyVisitor =
      await this.visitorService.getByUserIdAndJourneyId(userId, journeyId)

    if (visitorAndJourneyVisitor == null) {
      throw new GraphQLError('Visitor does not exist', {
        extensions: { code: 'NOT_FOUND' }
      })
    }

    const { visitor, journeyVisitor } = visitorAndJourneyVisitor

    const validStep = await this.blockService.validateBlock(
      stepId,
      journeyId,
      'journeyId'
    )

    if (!validStep) {
      throw new GraphQLError(
        `Step ID ${
          stepId as string
        } does not exist on Journey with ID ${journeyId}`,
        { extensions: { code: 'NOT_FOUND' } }
      )
    }

    return { visitor, journeyVisitor, journeyId, block }
  }

  @FromPostgresql()
  async save<T>(input: Prisma.EventCreateInput): Promise<T> {
    return (await this.prismaService.event.create({
      data: input
    })) as unknown as T
  }

  async sendEventsEmail(journeyId: string, visitorId: string): Promise<void> {
    const jobId = `visitor-event-${journeyId}-${visitorId}`
    const visitorEmailJob = await this.emailQueue.getJob(jobId)

    if (visitorEmailJob != null) {
      await this.emailQueue.remove(jobId)
      await this.emailQueue.add(
        'visitor-event',
        {
          journeyId,
          visitorId
        },
        {
          jobId,
          delay: TWO_MINUTES,
          removeOnComplete: true,
          removeOnFail: { age: ONE_DAY, count: 50 }
        }
      )
    } else {
      await this.emailQueue.add(
        'visitor-event',
        {
          journeyId,
          visitorId
        },
        {
          jobId,
          delay: TWO_MINUTES,
          removeOnComplete: true,
          removeOnFail: { age: ONE_DAY, count: 50 }
        }
      )
    }
  }

  async resetEventsEmailDelay(
    journeyId: string,
    visitorId: string,
    delay?: number
  ): Promise<void> {
    const jobId = `visitor-event-${journeyId}-${visitorId}`
    const visitorEmailJob = await this.emailQueue.getJob(jobId)

    if (visitorEmailJob != null) {
      const baseDelay = TWO_MINUTES
      const delayInMilliseconds = (delay ?? 0) * 1000
      const delayTimer = Math.max(delayInMilliseconds, baseDelay)
      await visitorEmailJob.changeDelay(delayTimer)
    }
  }

  generateWhere(
    journeyId: string,
    filter: JourneyEventsFilter
  ): Prisma.EventWhereInput {
    return omitBy(
      {
        journeyId,
        createdAt: {
          gte: filter?.periodRangeStart ?? undefined,
          lte: filter?.periodRangeEnd ?? undefined
        },
        AND:
          filter?.typenames != null
            ? [
                {
                  typename: { in: filter.typenames }
                }
              ]
            : undefined
      },
      isNil
    )
  }

  async getJourneyEvents({
    journeyId,
    filter,
    first,
    after
  }: {
    journeyId: string
    filter: JourneyEventsFilter
    first: number
    after?: string | null
  }): Promise<JourneyEventsConnection> {
    const where = this.generateWhere(journeyId, filter)

    const result = await this.prismaService.event.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      cursor: after != null ? { id: after } : undefined,
      skip: after == null ? 0 : 1,
      take: first + 1
    })

    const sendResult = result.length > first ? result.slice(0, -1) : result
    return {
      edges: sendResult.map((event) => ({
        node: {
          ...event,
          journeyId: event.journeyId ?? '',
          createdAt: event.createdAt.toISOString(),
          buttonAction: event.action ?? null
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
