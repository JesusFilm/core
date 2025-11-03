import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'
import { GraphQLError } from 'graphql'

import { FromPostgresql } from '@core/nest/decorators/FromPostgresql'
import {
  Block,
  JourneyVisitor,
  Prisma,
  Visitor
} from '@core/prisma/journeys/client'
import { EventsNotificationJob } from '@core/yoga/emailEvents/types'

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
}
