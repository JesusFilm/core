import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'
import {
  VideoResponse,
  VideoResponseCreateInput
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'

@Resolver('VideoResponse')
export class VideoResponseResolver {
  constructor(private readonly eventService: EventService) {}
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async videoResponseCreate(
    @Args('input') input: VideoResponseCreateInput & { __typename }
  ): Promise<VideoResponse> {
    input.__typename = 'VideoEvent'
    return await this.eventService.save(input)
  }
}
