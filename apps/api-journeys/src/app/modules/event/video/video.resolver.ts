import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import {
  VideoStartEvent,
  VideoStartEventCreateInput,
  VideoPlayEvent,
  VideoPlayEventCreateInput,
  VideoPauseEvent,
  VideoPauseEventCreateInput,
  VideoCompleteEvent,
  VideoCompleteEventCreateInput,
  VideoExpandEvent,
  VideoExpandEventCreateInput,
  VideoCollapseEvent,
  VideoCollapseEventCreateInput,
  VideoProgressEvent,
  VideoProgressEventCreateInput,
  VideoBlockSource
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'
import { BlockService } from '../../block/block.service'

@Resolver('VideoStartEvent')
@UseGuards(GqlAuthGuard)
export class VideoStartEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly blockService: BlockService
  ) {}

  @Mutation()
  async videoStartEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: VideoStartEventCreateInput
  ): Promise<VideoStartEvent> {
    const block: {
      journeyId: string
      source: VideoBlockSource
      title: string
      videoId: string
      videoVariantLanguageId: string
    } = await this.blockService.get(input.blockId)
    const journeyId = block.journeyId

    const stepBlock = await this.eventService.getParentStepBlockByBlockId(
      input.blockId
    )

    const visitor = await this.eventService.getVisitorByUserIdAndJourneyId(
      userId,
      journeyId
    )

    return await this.eventService.save({
      ...input,
      __typename: 'VideoStartEvent',
      visitorId: visitor.id,
      createdAt: new Date().toISOString(),
      journeyId,
      stepId: stepBlock?.id,
      label: block.source,
      value: block.title,
      videoId: block.videoId,
      videoVariantLanguageId: block.videoVariantLanguageId
    })
  }
}
@Resolver('VideoPlayEvent')
@UseGuards(GqlAuthGuard)
export class VideoPlayEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly blockService: BlockService
  ) {}

  @Mutation()
  async videoPlayEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: VideoPlayEventCreateInput
  ): Promise<VideoPlayEvent> {
    const block: {
      journeyId: string
      source: VideoBlockSource
      title: string
      videoId: string
      videoVariantLanguageId: string
    } = await this.blockService.get(input.blockId)
    const journeyId = block.journeyId

    const stepBlock = await this.eventService.getParentStepBlockByBlockId(
      input.blockId
    )

    const visitor = await this.eventService.getVisitorByUserIdAndJourneyId(
      userId,
      journeyId
    )

    return await this.eventService.save({
      ...input,
      __typename: 'VideoPlayEvent',
      visitorId: visitor.id,
      createdAt: new Date().toISOString(),
      journeyId,
      stepId: stepBlock?.id,
      label: block.source,
      value: block.title,
      videoId: block.videoId,
      videoVariantLanguageId: block.videoVariantLanguageId
    })
  }
}
@Resolver('VideoPauseEvent')
@UseGuards(GqlAuthGuard)
export class VideoPuaseEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly blockService: BlockService
  ) {}

  @Mutation()
  async videoPauseEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: VideoPauseEventCreateInput
  ): Promise<VideoPauseEvent> {
    const block: {
      journeyId: string
      source: VideoBlockSource
      title: string
      videoId: string
      videoVariantLanguageId: string
    } = await this.blockService.get(input.blockId)
    const journeyId = block.journeyId

    const stepBlock = await this.eventService.getParentStepBlockByBlockId(
      input.blockId
    )

    const visitor = await this.eventService.getVisitorByUserIdAndJourneyId(
      userId,
      journeyId
    )

    return await this.eventService.save({
      ...input,
      __typename: 'VideoPauseEvent',
      visitorId: visitor.id,
      createdAt: new Date().toISOString(),
      journeyId,
      stepId: stepBlock?.id,
      label: block.source,
      value: block.title,
      videoId: block.videoId,
      videoVariantLanguageId: block.videoVariantLanguageId
    })
  }
}
@Resolver('VideoCompleteEvent')
@UseGuards(GqlAuthGuard)
export class VideoCompleteEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly blockService: BlockService
  ) {}

  @Mutation()
  async videoCompleteEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: VideoCompleteEventCreateInput
  ): Promise<VideoCompleteEvent> {
    const block: {
      journeyId: string
      source: VideoBlockSource
      title: string
      videoId: string
      videoVariantLanguageId: string
    } = await this.blockService.get(input.blockId)
    const journeyId = block.journeyId

    const stepBlock = await this.eventService.getParentStepBlockByBlockId(
      input.blockId
    )

    const visitor = await this.eventService.getVisitorByUserIdAndJourneyId(
      userId,
      journeyId
    )

    return await this.eventService.save({
      ...input,
      __typename: 'VideoCompleteEvent',
      visitorId: visitor.id,
      createdAt: new Date().toISOString(),
      journeyId,
      stepId: stepBlock?.id,
      label: block.source,
      value: block.title,
      videoId: block.videoId,
      videoVariantLanguageId: block.videoVariantLanguageId
    })
  }
}
@Resolver('VideoExpandEvent')
@UseGuards(GqlAuthGuard)
export class VideoExpandEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly blockService: BlockService
  ) {}

  @Mutation()
  async videoExpandEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: VideoExpandEventCreateInput
  ): Promise<VideoExpandEvent> {
    const block: {
      journeyId: string
      source: VideoBlockSource
      title: string
      videoId: string
      videoVariantLanguageId: string
    } = await this.blockService.get(input.blockId)
    const journeyId = block.journeyId

    const stepBlock = await this.eventService.getParentStepBlockByBlockId(
      input.blockId
    )

    const visitor = await this.eventService.getVisitorByUserIdAndJourneyId(
      userId,
      journeyId
    )

    return await this.eventService.save({
      ...input,
      __typename: 'VideoExpandEvent',
      visitorId: visitor.id,
      createdAt: new Date().toISOString(),
      journeyId,
      stepId: stepBlock?.id,
      label: block.source,
      value: block.title,
      videoId: block.videoId,
      videoVariantLanguageId: block.videoVariantLanguageId
    })
  }
}
@Resolver('VideoCollapseEvent')
@UseGuards(GqlAuthGuard)
export class VideoCollapseEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly blockService: BlockService
  ) {}

  @Mutation()
  async videoCollapseEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: VideoCollapseEventCreateInput
  ): Promise<VideoCollapseEvent> {
    const block: {
      journeyId: string
      source: VideoBlockSource
      title: string
      videoId: string
      videoVariantLanguageId: string
    } = await this.blockService.get(input.blockId)
    const journeyId = block.journeyId

    const stepBlock = await this.eventService.getParentStepBlockByBlockId(
      input.blockId
    )

    const visitor = await this.eventService.getVisitorByUserIdAndJourneyId(
      userId,
      journeyId
    )

    return await this.eventService.save({
      ...input,
      __typename: 'VideoCollapseEvent',
      visitorId: visitor.id,
      createdAt: new Date().toISOString(),
      journeyId,
      stepId: stepBlock?.id,
      label: block.source,
      value: block.title,
      videoId: block.videoId,
      videoVariantLanguageId: block.videoVariantLanguageId
    })
  }
}
@Resolver('VideoProgressEvent')
@UseGuards(GqlAuthGuard)
export class VideoProgressEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly blockService: BlockService
  ) {}

  @Mutation()
  async videoProgressEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: VideoProgressEventCreateInput
  ): Promise<VideoProgressEvent> {
    const block: {
      journeyId: string
      source: VideoBlockSource
      title: string
      videoId: string
      videoVariantLanguageId: string
    } = await this.blockService.get(input.blockId)
    const journeyId = block.journeyId

    const stepBlock = await this.eventService.getParentStepBlockByBlockId(
      input.blockId
    )

    const visitor = await this.eventService.getVisitorByUserIdAndJourneyId(
      userId,
      journeyId
    )

    return await this.eventService.save({
      ...input,
      __typename: 'VideoProgressEvent',
      visitorId: visitor.id,
      createdAt: new Date().toISOString(),
      journeyId,
      stepId: stepBlock?.id,
      label: block.source,
      value: block.title,
      videoId: block.videoId,
      videoVariantLanguageId: block.videoVariantLanguageId
    })
  }
}
