import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'

import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'

import {
  VideoBlockSource,
  VideoCollapseEvent,
  VideoCollapseEventCreateInput,
  VideoCompleteEvent,
  VideoCompleteEventCreateInput,
  VideoExpandEvent,
  VideoExpandEventCreateInput,
  VideoPauseEvent,
  VideoPauseEventCreateInput,
  VideoPlayEvent,
  VideoPlayEventCreateInput,
  VideoProgressEvent,
  VideoProgressEventCreateInput,
  VideoStartEvent,
  VideoStartEventCreateInput
} from '../../../__generated__/graphql'
import { PrismaService } from '../../../lib/prisma.service'
import { EventService } from '../event.service'

@Resolver('VideoStartEvent')
@UseGuards(GqlAuthGuard)
export class VideoStartEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly prismaService: PrismaService
  ) {}

  @Mutation()
  async videoStartEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: VideoStartEventCreateInput
  ): Promise<VideoStartEvent> {
    const { visitor, journeyId } = await this.eventService.validateBlockEvent(
      userId,
      input.blockId,
      input.stepId
    )

    const video = await this.prismaService.block.findUnique({
      where: { id: input.blockId },
      select: {
        duration: true,
        startAt: true,
        endAt: true
      }
    })

    const delay =
      video?.endAt != null && video?.startAt != null
        ? video.endAt - video.startAt
        : (video?.duration ?? 0)

    await this.eventService.resetEventsEmailDelay(journeyId, visitor.id, delay)

    return await this.eventService.save({
      ...input,
      id: input.id ?? undefined,
      typename: 'VideoStartEvent',
      visitor: { connect: { id: visitor.id } },
      stepId: input.stepId ?? undefined,
      journey: { connect: { id: journeyId } }
    })
  }

  @ResolveField('source')
  source(@Parent() event): VideoBlockSource | undefined {
    return VideoBlockSource[event.value]
  }
}
@Resolver('VideoPlayEvent')
@UseGuards(GqlAuthGuard)
export class VideoPlayEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly prismaService: PrismaService
  ) {}

  @Mutation()
  async videoPlayEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: VideoPlayEventCreateInput
  ): Promise<VideoPlayEvent> {
    const { visitor, journeyId } = await this.eventService.validateBlockEvent(
      userId,
      input.blockId,
      input.stepId
    )

    const video = await this.prismaService.block.findUnique({
      where: { id: input.blockId },
      select: {
        duration: true,
        startAt: true,
        endAt: true
      }
    })

    const delay =
      video?.endAt != null && video?.startAt != null
        ? video.endAt - video.startAt
        : (video?.duration ?? 0)

    await this.eventService.resetEventsEmailDelay(journeyId, visitor.id, delay)

    return await this.eventService.save({
      ...input,
      id: input.id ?? undefined,
      typename: 'VideoPlayEvent',
      visitor: { connect: { id: visitor.id } },
      stepId: input.stepId ?? undefined,
      journey: { connect: { id: journeyId } }
    })
  }

  @ResolveField('source')
  source(@Parent() event): VideoBlockSource | undefined {
    return VideoBlockSource[event.value]
  }
}

@Resolver('VideoPauseEvent')
@UseGuards(GqlAuthGuard)
export class VideoPauseEventResolver {
  constructor(private readonly eventService: EventService) {}

  @Mutation()
  async videoPauseEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: VideoPauseEventCreateInput
  ): Promise<VideoPauseEvent> {
    const { visitor, journeyId } = await this.eventService.validateBlockEvent(
      userId,
      input.blockId,
      input.stepId
    )

    return await this.eventService.save({
      ...input,
      id: input.id ?? undefined,
      typename: 'VideoPauseEvent',
      visitor: { connect: { id: visitor.id } },
      journey: { connect: { id: journeyId } },
      stepId: input.stepId ?? undefined
    })
  }

  @ResolveField('source')
  source(@Parent() event): VideoBlockSource | undefined {
    return VideoBlockSource[event.value]
  }
}

@Resolver('VideoCompleteEvent')
@UseGuards(GqlAuthGuard)
export class VideoCompleteEventResolver {
  constructor(private readonly eventService: EventService) {}

  @Mutation()
  async videoCompleteEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: VideoCompleteEventCreateInput
  ): Promise<VideoCompleteEvent> {
    const { visitor, journeyId } = await this.eventService.validateBlockEvent(
      userId,
      input.blockId,
      input.stepId
    )

    await this.eventService.resetEventsEmailDelay(journeyId, visitor.id)

    return await this.eventService.save({
      ...input,
      id: input.id ?? undefined,
      typename: 'VideoCompleteEvent',
      visitor: { connect: { id: visitor.id } },
      journey: { connect: { id: journeyId } },
      stepId: input.stepId ?? undefined
    })
  }

  @ResolveField('source')
  source(@Parent() event): VideoBlockSource | undefined {
    return VideoBlockSource[event.value]
  }
}

@Resolver('VideoExpandEvent')
@UseGuards(GqlAuthGuard)
export class VideoExpandEventResolver {
  constructor(private readonly eventService: EventService) {}

  @Mutation()
  async videoExpandEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: VideoExpandEventCreateInput
  ): Promise<VideoExpandEvent> {
    const { visitor, journeyId } = await this.eventService.validateBlockEvent(
      userId,
      input.blockId,
      input.stepId
    )

    return await this.eventService.save({
      ...input,
      id: input.id ?? undefined,
      typename: 'VideoExpandEvent',
      visitor: { connect: { id: visitor.id } },
      journey: { connect: { id: journeyId } },
      stepId: input.stepId ?? undefined
    })
  }

  @ResolveField('source')
  source(@Parent() event): VideoBlockSource | undefined {
    return VideoBlockSource[event.value]
  }
}

@Resolver('VideoCollapseEvent')
@UseGuards(GqlAuthGuard)
export class VideoCollapseEventResolver {
  constructor(private readonly eventService: EventService) {}

  @Mutation()
  async videoCollapseEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: VideoCollapseEventCreateInput
  ): Promise<VideoCollapseEvent> {
    const { visitor, journeyId } = await this.eventService.validateBlockEvent(
      userId,
      input.blockId,
      input.stepId
    )

    return await this.eventService.save({
      ...input,
      id: input.id ?? undefined,
      typename: 'VideoCollapseEvent',
      visitor: { connect: { id: visitor.id } },
      journey: { connect: { id: journeyId } },
      stepId: input.stepId ?? undefined
    })
  }

  @ResolveField('source')
  source(@Parent() event): VideoBlockSource | undefined {
    return VideoBlockSource[event.value]
  }
}

@Resolver('VideoProgressEvent')
@UseGuards(GqlAuthGuard)
export class VideoProgressEventResolver {
  constructor(private readonly eventService: EventService) {}

  @Mutation()
  async videoProgressEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: VideoProgressEventCreateInput
  ): Promise<VideoProgressEvent> {
    const { visitor, journeyId } = await this.eventService.validateBlockEvent(
      userId,
      input.blockId,
      input.stepId
    )

    return await this.eventService.save({
      ...input,
      id: input.id ?? undefined,
      typename: 'VideoProgressEvent',
      visitor: { connect: { id: visitor.id } },
      journey: { connect: { id: journeyId } },
      stepId: input.stepId ?? undefined
    })
  }

  @ResolveField('source')
  source(@Parent() event): VideoBlockSource | undefined {
    return VideoBlockSource[event.value]
  }
}
