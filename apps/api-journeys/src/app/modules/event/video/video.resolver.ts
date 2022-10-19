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
  Block
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'

@Resolver('VideoStartEvent')
@UseGuards(GqlAuthGuard)
export class VideoStartEventResolver {
  constructor(private readonly eventService: EventService) {}
  @Mutation()
  async videoStartEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: VideoStartEventCreateInput
  ): Promise<VideoStartEvent> {
    const block: Block = await this.eventService.getBlockById(input.blockId)
    const journeyId = block.journeyId

    return await this.eventService.save({
      ...input,
      __typename: 'VideoStartEvent',
      userId,
      createdAt: new Date().toISOString(),
      journeyId,
      teamId: 'team.id' // TODO: update
    })
  }
}
@Resolver('VideoPlayEvent')
@UseGuards(GqlAuthGuard)
export class VideoPlayEventResolver {
  constructor(private readonly eventService: EventService) {}
  @Mutation()
  async videoPlayEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: VideoPlayEventCreateInput
  ): Promise<VideoPlayEvent> {
    const block: Block = await this.eventService.getBlockById(input.blockId)
    const journeyId = block.journeyId

    return await this.eventService.save({
      ...input,
      __typename: 'VideoPlayEvent',
      userId,
      createdAt: new Date().toISOString(),
      journeyId,
      teamId: 'team.id' // TODO: update
    })
  }
}
@Resolver('VideoPauseEvent')
@UseGuards(GqlAuthGuard)
export class VideoPuaseEventResolver {
  constructor(private readonly eventService: EventService) {}
  @Mutation()
  async videoPauseEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: VideoPauseEventCreateInput
  ): Promise<VideoPauseEvent> {
    const block: Block = await this.eventService.getBlockById(input.blockId)
    const journeyId = block.journeyId

    return await this.eventService.save({
      ...input,
      __typename: 'VideoPauseEvent',
      userId,
      createdAt: new Date().toISOString(),
      journeyId,
      teamId: 'team.id' // TODO: update
    })
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
    const block: Block = await this.eventService.getBlockById(input.blockId)
    const journeyId = block.journeyId

    return await this.eventService.save({
      ...input,
      __typename: 'VideoCompleteEvent',
      userId,
      createdAt: new Date().toISOString(),
      journeyId,
      teamId: 'team.id' // TODO: update
    })
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
    const block: Block = await this.eventService.getBlockById(input.blockId)
    const journeyId = block.journeyId

    return await this.eventService.save({
      ...input,
      __typename: 'VideoExpandEvent',
      userId,
      createdAt: new Date().toISOString(),
      journeyId,
      teamId: 'team.id' // TODO: update
    })
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
    const block: Block = await this.eventService.getBlockById(input.blockId)
    const journeyId = block.journeyId

    return await this.eventService.save({
      ...input,
      __typename: 'VideoCollapseEvent',
      userId,
      createdAt: new Date().toISOString(),
      journeyId,
      teamId: 'team.id' // TODO: update
    })
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
    const block: Block = await this.eventService.getBlockById(input.blockId)
    const journeyId = block.journeyId

    return await this.eventService.save({
      ...input,
      __typename: 'VideoProgressEvent',
      userId,
      createdAt: new Date().toISOString(),
      journeyId,
      teamId: 'team.id' // TODO: update
    })
  }
}
