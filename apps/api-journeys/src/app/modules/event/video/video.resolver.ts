import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators'
import {
  VideoPlayEvent,
  VideoPlayEventCreateInput,
  VideoMuteEvent,
  VideoMuteEventCreateInput,
  VideoFullscreenEvent,
  VideoFullscreenEventCreateInput,
  VideoViewEvent,
  VideoViewEventCreateInput
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'

@Resolver('VideoEvent')
@UseGuards(GqlAuthGuard)
export class VideoEventResolver {
  constructor(private readonly eventService: EventService) {}

  @Mutation()
  async videoPlayEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: VideoPlayEventCreateInput & { __typename }
  ): Promise<VideoPlayEvent> {
    input.__typename = 'VideoPlayEvent'
    return await this.eventService.save({ ...input, userId })
  }

  @Mutation()
  async videoMuteEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: VideoMuteEventCreateInput & { __typename }
  ): Promise<VideoMuteEvent> {
    input.__typename = 'VideoMuteEvent'
    return await this.eventService.save({ ...input, userId })
  }

  @Mutation()
  async videoFullscreenEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: VideoFullscreenEventCreateInput & { __typename }
  ): Promise<VideoFullscreenEvent> {
    input.__typename = 'VideoFullscreenEvent'
    return await this.eventService.save({ ...input, userId })
  }

  @Mutation()
  async videoViewEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: VideoViewEventCreateInput & { __typename }
  ): Promise<VideoViewEvent> {
    input.__typename = 'VideoViewEvent'
    return await this.eventService.save({ ...input, userId })
  }
}
