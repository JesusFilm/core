import { Resolver, Query, Args } from '@nestjs/graphql'

import { VideoTag } from '../../__generated__/graphql'
import { VideoTagService } from './tag.service'

@Resolver('VideoTag')
export class VideoTagResolver {
  constructor(private readonly videoTagService: VideoTagService) {}

  @Query()
  async videoTags(): Promise<VideoTag[]> {
    return await this.videoTagService.getAll()
  }

  @Query()
  async videoTag(@Args('id') id: string): Promise<VideoTag> {
    return await this.videoTagService.get(id)
  }
}
