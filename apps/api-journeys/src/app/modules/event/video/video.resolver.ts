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

@Resolver('VideoEvent')
@UseGuards(GqlAuthGuard)
export class VideoEventResolver {
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
    @Args('input') input: VideoPlayEventCreateInput & { __typename }
  ): Promise<VideoPlayEvent> {
    input.__typename = 'VideoPlayEvent'
    return await this.eventService.save({ ...input, userId })
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
