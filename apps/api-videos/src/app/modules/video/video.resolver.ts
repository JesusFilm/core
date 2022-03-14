import {
  Resolver,
  Query,
  Args,
  Info
} from '@nestjs/graphql'
import { KeyAsId } from '@core/nest/decorators'
import { Video, VideosFilter } from '../../__generated__/graphql'
import { VideoService } from './video.service'

@Resolver('Video')
export class VideoResolver {
  constructor(private readonly videoService: VideoService) {}

  @Query()
  @KeyAsId()
  async videos(
    @Info() info,
    @Args('where') where?: VideosFilter,
    @Args('page') page?: number,
    @Args('limit') limit?: number
  ): Promise<Video[]> {
    const variantLanguageId = info.fieldNodes[0].selectionSet.selections
      .find(({ name }) => name.value === 'variant')
      ?.arguments.find(({ name }) => name.value === 'languageId')?.value?.value
    return await this.videoService.filterAll(
      where?.title,
      where?.availableVariantLanguageIds ?? undefined,
      variantLanguageId,
      page,
      limit
    )
  }
}
