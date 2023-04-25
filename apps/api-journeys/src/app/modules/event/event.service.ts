import { Injectable, Inject } from '@nestjs/common'
import { UserInputError } from 'apollo-server-errors'
import { omit } from 'lodash'
import { Visitor, Event } from '.prisma/api-journeys-client'
import { BlockService } from '../block/block.service'
import { VisitorService } from '../visitor/visitor.service'
import { PrismaService } from '../../lib/prisma.service'
import {
  ButtonClickEvent,
  ChatOpenEvent,
  JourneyViewEvent,
  RadioQuestionSubmissionEvent,
  SignUpSubmissionEvent,
  StepNextEvent,
  StepViewEvent,
  TextResponseSubmissionEvent,
  VideoCollapseEvent,
  VideoCompleteEvent,
  VideoExpandEvent,
  VideoPauseEvent,
  VideoPlayEvent,
  VideoProgressEvent,
  VideoStartEvent
} from '../../__generated__/graphql'

type EventCollections =
  | Partial<ButtonClickEvent>
  | Partial<ChatOpenEvent>
  | Partial<JourneyViewEvent>
  | Partial<RadioQuestionSubmissionEvent>
  | Partial<StepNextEvent>
  | Partial<StepViewEvent>
  | Partial<SignUpSubmissionEvent>
  | Partial<TextResponseSubmissionEvent>
  | Partial<VideoCollapseEvent>
  | Partial<VideoCompleteEvent>
  | Partial<VideoExpandEvent>
  | Partial<VideoPauseEvent>
  | Partial<VideoPlayEvent>
  | Partial<VideoProgressEvent>
  | Partial<VideoStartEvent>

type EventTypes = EventCollections & {
  visitorId: string
  __typename?: string
  stepId?: string
  blockId?: string
}

@Injectable()
export class EventService {
  @Inject(PrismaService) private readonly prismaService: PrismaService
  @Inject(BlockService)
  private readonly blockService: BlockService

  @Inject(VisitorService)
  private readonly visitorService: VisitorService

  async validateBlockEvent(
    userId: string,
    blockId: string,
    stepId: string | null = null
  ): Promise<{
    visitor: Visitor
    journeyId: string
  }> {
    const block: { journeyId: string; _key: string } | undefined =
      await this.blockService.get(blockId)

    if (block == null) {
      throw new UserInputError('Block does not exist')
    }
    const journeyId = block.journeyId

    const visitor = await this.visitorService.getByUserIdAndJourneyId(
      userId,
      journeyId
    )

    const validStep = await this.blockService.validateBlock(
      stepId,
      journeyId,
      'journeyId'
    )

    if (!validStep) {
      throw new UserInputError(
        `Step ID ${
          stepId as string
        } does not exist on Journey with ID ${journeyId}`
      )
    }

    return { visitor, journeyId }
  }

  async save<T>(input: EventTypes): Promise<T> {
    const result = await this.prismaService.event.create({
      data: {
        id: input.id ?? undefined,
        typename: input.__typename ?? 'Event',
        createdAt:
          input.createdAt != null && typeof input.createdAt === 'string'
            ? new Date(input.createdAt)
            : undefined,
        journeyId: input.journeyId ?? undefined,
        label: input.label,
        value: input.value,
        visitorId: input.visitorId,
        extra: omit(input, [
          '_id',
          '_key',
          '_rev',
          '__typename',
          'journeyId',
          'createdAt',
          'label',
          'value',
          'visitorId'
        ]) as object
      }
    })
    return {
      ...omit(result, 'extra'),
      id: result.id,
      __typename: result.typename,
      createdAt: result.createdAt.toISOString(),
      ...(result.extra as object)
    } as unknown as T
  }
}
