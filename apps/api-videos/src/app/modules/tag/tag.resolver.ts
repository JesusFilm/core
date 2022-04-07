import { Resolver, Query, Args } from '@nestjs/graphql'

import { VideoTag } from '../../__generated__/graphql'
import { VideoTagService } from './tag.service'

@Resolver('VideoTag')
export class VideoTagResolver {
  constructor(private readonly videoTagService: VideoTagService) {}

  @Query()
  async videoTags(): Promise<VideoTag[]> {
    const result = await this.videoTagService.getAll<VideoTag>()
    console.log(result)
    return result
  }

  @Query()
  async videoTag(@Args('id') id: string): Promise<VideoTag> {
    const result = await this.videoTagService.get<VideoTag>(id)
    console.log(result)
    return result
  }
}
