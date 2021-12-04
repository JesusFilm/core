
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { VideoResponse, VideoResponseCreateInput } from '../../../graphql'
import { IdAsKey } from '../../../lib/decorators'
import { AuthGuard } from '../../auth/auth.guard'
import { ResponseService } from '../response.service'

@Resolver('Response')
export class VideoResponseResolver {
  constructor(private readonly responseservice: ResponseService) { }
  @Mutation()
  @IdAsKey()
  @UseGuards(new AuthGuard())
  async videoResponseCreate(
    @Args('input') input: VideoResponseCreateInput
  ): Promise<VideoResponse> {
    input.type = 'VideoResponse'
    return await this.responseservice.save(input)
  }
}
