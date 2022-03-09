import { Resolver, Query } from '@nestjs/graphql'
import { KeyAsId } from '@core/nest/decorators'
import { Video } from '../../__generated__/graphql'
import { VideoService } from './video.service'

@Resolver('Video')
export class VideoResolver {
  constructor(private readonly videoService: VideoService) {}

  @Query()
  @KeyAsId()
  async videos(): Promise<Video[]> {
    return await this.videoService.getAll()
  }
}
