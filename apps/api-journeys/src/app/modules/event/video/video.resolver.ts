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
  VideoBlock
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
    const block: VideoBlock = await this.blockService.get(input.blockId)
    const journeyId = block.journeyId
    const stepName: string =
      block.parentBlockId != null
        ? await this.eventService.getStepHeader(block.parentBlockId)
        : 'Untitled'
    const videoTitle = block.title ?? 'Untitled'
    const videoSource = block.source

    return await this.eventService.save({
      ...input,
      __typename: 'VideoStartEvent',
      userId,
      createdAt: new Date().toISOString(),
      journeyId,
      stepName,
      videoTitle,
      videoSource,
      teamId: 'team.id' // TODO: update
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
    const block: VideoBlock = await this.blockService.get(input.blockId)
    const journeyId = block.journeyId
    const stepName: string =
      block.parentBlockId != null
        ? await this.eventService.getStepHeader(block.parentBlockId)
        : 'Untitled'
    const videoTitle = block.title ?? 'Untitled'
    const videoSource = block.source

    return await this.eventService.save({
      ...input,
      __typename: 'VideoPlayEvent',
      userId,
      createdAt: new Date().toISOString(),
      journeyId,
      stepName,
      videoTitle,
      videoSource,
      teamId: 'team.id' // TODO: update
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
    const block: VideoBlock = await this.blockService.get(input.blockId)
    const journeyId = block.journeyId
    const stepName: string =
      block.parentBlockId != null
        ? await this.eventService.getStepHeader(block.parentBlockId)
        : 'Untitled'
    const videoTitle = block.title ?? 'Untitled'
    const videoSource = block.source

    return await this.eventService.save({
      ...input,
      __typename: 'VideoPauseEvent',
      userId,
      createdAt: new Date().toISOString(),
      journeyId,
      stepName,
      videoTitle,
      videoSource,
      teamId: 'team.id' // TODO: update
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
    const block: VideoBlock = await this.blockService.get(input.blockId)
    const journeyId = block.journeyId
    const stepName: string =
      block.parentBlockId != null
        ? await this.eventService.getStepHeader(block.parentBlockId)
        : 'Untitled'
    const videoTitle = block.title ?? 'Untitled'
    const videoSource = block.source

    return await this.eventService.save({
      ...input,
      __typename: 'VideoCompleteEvent',
      userId,
      createdAt: new Date().toISOString(),
      journeyId,
      stepName,
      videoTitle,
      videoSource,
      teamId: 'team.id' // TODO: update
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
    const block: VideoBlock = await this.blockService.get(input.blockId)
    const journeyId = block.journeyId
    const stepName: string =
      block.parentBlockId != null
        ? await this.eventService.getStepHeader(block.parentBlockId)
        : 'Untitled'
    const videoTitle = block.title ?? 'Untitled'
    const videoSource = block.source

    return await this.eventService.save({
      ...input,
      __typename: 'VideoExpandEvent',
      userId,
      createdAt: new Date().toISOString(),
      journeyId,
      stepName,
      videoTitle,
      videoSource,
      teamId: 'team.id' // TODO: update
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
    const block: VideoBlock = await this.blockService.get(input.blockId)
    const journeyId = block.journeyId
    const stepName: string =
      block.parentBlockId != null
        ? await this.eventService.getStepHeader(block.parentBlockId)
        : 'Untitled'
    const videoTitle = block.title ?? 'Untitled'
    const videoSource = block.source

    return await this.eventService.save({
      ...input,
      __typename: 'VideoCollapseEvent',
      userId,
      createdAt: new Date().toISOString(),
      journeyId,
      stepName,
      videoTitle,
      videoSource,
      teamId: 'team.id' // TODO: update
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
    const block: VideoBlock = await this.blockService.get(input.blockId)
    const journeyId = block.journeyId
    const stepName: string =
      block.parentBlockId != null
        ? await this.eventService.getStepHeader(block.parentBlockId)
        : 'Untitled'
    const videoTitle = block.title ?? 'Untitled'
    const videoSource = block.source

    return await this.eventService.save({
      ...input,
      __typename: 'VideoProgressEvent',
      userId,
      createdAt: new Date().toISOString(),
      journeyId,
      stepName,
      videoTitle,
      videoSource,
      teamId: 'team.id' // TODO: update
    })
  }
}
