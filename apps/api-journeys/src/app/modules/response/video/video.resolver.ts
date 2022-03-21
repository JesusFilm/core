import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'
import {
  VideoResponse,
  VideoResponseCreateInput
} from '../../../__generated__/graphql'
import { ResponseService } from '../response.service'

@Resolver('VideoResponse')
export class VideoResponseResolver {
  constructor(private readonly responseService: ResponseService) {}
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async videoResponseCreate(
    @Args('input') input: VideoResponseCreateInput & { __typename }
  ): Promise<VideoResponse> {
    input.__typename = 'VideoResponse'
    return await this.responseService.save(input)
  }
}
