
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { VideoResponse, VideoResponseCreateInput } from '../../../graphql'
import { IdAsKey } from '@core/nest/decorators'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'
import { ResponseService } from '../response.service'

@Resolver('Response')
export class VideoResponseResolver {
  constructor(private readonly responseservice: ResponseService) { }
  @Mutation()
  @UseGuards(GqlAuthGuard)
  @IdAsKey()
  async videoResponseCreate(
    @Args('input') input: VideoResponseCreateInput
  ): Promise<VideoResponse> {
    input.type = 'VideoResponse'
    return await this.responseservice.save(input)
  }
}
