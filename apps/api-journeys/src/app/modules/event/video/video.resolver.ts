import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators'
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
  VideoProgressEventCreateInput
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
    return await this.eventService.save({
      ...input,
      __typename: 'VideoStartEvent',
      userId
    })
  }
}
@Resolver('VideoPlayEvent')
@UseGuards(GqlAuthGuard)
export class VideoPlayEventResolver {
  constructor(private readonly eventService: EventService) {}

  @Mutation()
  async videoStartEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: VideoStartEventCreateInput & { __typename }
  ): Promise<VideoStartEvent> {
    input.__typename = 'VideoStartEvent'
    return await this.eventService.save({ ...input, userId })
  }

  @Mutation()
  async videoPlayEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: VideoPlayEventCreateInput
  ): Promise<VideoPlayEvent> {
    return await this.eventService.save({
      ...input,
      __typename: 'VideoPlayEvent',
      userId
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
    return await this.eventService.save({
      ...input,
      __typename: 'VideoPauseEvent',
      userId
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
    return await this.eventService.save({
      ...input,
      __typename: 'VideoCompleteEvent',
      userId
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
    return await this.eventService.save({
      ...input,
      __typename: 'VideoExpandEvent',
      userId
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
    return await this.eventService.save({
      ...input,
      __typename: 'VideoCollapseEvent',
      userId
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
    return await this.eventService.save({
      ...input,
      __typename: 'VideoProgressEvent',
      userId
    })
  }

  @Mutation()
  async videoPauseEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: VideoPauseEventCreateInput & { __typename }
  ): Promise<VideoPauseEvent> {
    input.__typename = 'VideoPauseEvent'
    return await this.eventService.save({ ...input, userId })
  }

  @Mutation()
  async videoCompleteEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: VideoCompleteEventCreateInput & { __typename }
  ): Promise<VideoCompleteEvent> {
    input.__typename = 'VideoCompleteEvent'
    return await this.eventService.save({ ...input, userId })
  }

  @Mutation()
  async videoExpandEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: VideoExpandEventCreateInput & { __typename }
  ): Promise<VideoExpandEvent> {
    input.__typename = 'VideoExpandEvent'
    return await this.eventService.save({ ...input, userId })
  }

  @Mutation()
  async videoCollapseEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: VideoCollapseEventCreateInput & { __typename }
  ): Promise<VideoCollapseEvent> {
    input.__typename = 'VideoCollapseEvent'
    return await this.eventService.save({ ...input, userId })
  }

  @Mutation()
  async videoProgressEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: VideoProgressEventCreateInput & { __typename }
  ): Promise<VideoProgressEvent> {
    input.__typename = 'VideoProgressEvent'
    return await this.eventService.save({ ...input, userId })
  }
}
