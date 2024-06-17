import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'
import { GraphQLError } from 'graphql'

import { JourneyVisitor, Prisma, Visitor } from '.prisma/api-journeys-client'
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

    return { visitor, journeyVisitor, journeyId }
  }

  @FromPostgresql()
  async save<T>(input: Prisma.EventCreateInput): Promise<T> {
    return (await this.prismaService.event.create({
      data: input
    })) as unknown as T
  }

  async sendEventsEmail(
    journeyId: string,
    visitorId: string,
    videoEvent?: 'start' | 'play'
  ): Promise<void> {
    const jobId = `visitor-event-${journeyId}-${visitorId}`
    const visitorEmailJob = await this.emailQueue.getJob(jobId)

    const removalFlags = ['start', 'play', null, undefined]
    const removeJob = removalFlags.includes(videoEvent)
    const isVideoEvent = videoEvent === 'start' || videoEvent === 'play'

    if (visitorEmailJob != null) {
      const jobState = await this.emailQueue.getJobState(jobId)

      if (removeJob) await this.emailQueue.remove(jobId)
      if (jobState !== 'completed' && !isVideoEvent)
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
}
