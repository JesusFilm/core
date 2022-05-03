import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'
import {
  VideoEvent,
  VideoEventCreateInput
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'

@Resolver('VideoEvent')
export class VideoEventResolver {
  constructor(private readonly eventService: EventService) {}
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async videoEventCreate(
    @Args('input') input: VideoEventCreateInput & { __typename }
  ): Promise<VideoEvent> {
    input.__typename = 'VideoEvent'
    return await this.eventService.save(input)
  }
}
