import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators'
import {
  VideoPlayEvent,
  VideoPlayEventCreateInput
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'

@Resolver('VideoPlayEvent')
export class VideoPlayEventResolver {
  constructor(private readonly eventService: EventService) {}
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async videoPlayEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: VideoPlayEventCreateInput & { __typename }
  ): Promise<VideoPlayEvent> {
    input.__typename = 'VideoPlayEvent'
    return await this.eventService.save({ ...input, userId })
  }
}
