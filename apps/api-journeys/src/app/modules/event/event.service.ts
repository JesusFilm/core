import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'
import { GraphQLError } from 'graphql'

import {
  Block,
  JourneyVisitor,
  Prisma,
  Visitor
} from '.prisma/api-journeys-client'
import { FromPostgresql } from '@core/nest/decorators/FromPostgresql'

import { PrismaService } from '../../lib/prisma.service'
import { BlockService } from '../block/block.service'
import { EventsNotificationJob } from '../email/emailEvents/emailEvents.consumer'
import { VisitorService } from '../visitor/visitor.service'

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
          delay: 2 * 60 * 1000, // delay for 2 minutes
          removeOnComplete: true,
          removeOnFail: { age: 24 * 36000 } // keep up to 24 hours
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
          delay: 2 * 60 * 1000, // delay for 2 minutes
          removeOnComplete: true,
          removeOnFail: { age: 24 * 36000 } // keep up to 24 hours
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
      const baseDelay = 2 * 60 * 1000
      const delayInMilliseconds = (delay ?? 0) * 1000
      const delayTimer = Math.max(delayInMilliseconds, baseDelay)
      await visitorEmailJob.changeDelay(delayTimer)
    }
  }
}
