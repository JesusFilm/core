import { Resolver, Query, Args, Info, ResolveReference } from '@nestjs/graphql'
import { Video, VideosFilter } from '../../__generated__/graphql'
import { VideoService } from './video.service'

@Resolver('Video')
export class VideoResolver {
  constructor(private readonly videoService: VideoService) {}

  @Query()
  async videos(
    @Info() info,
    @Args('where') where?: VideosFilter,
    @Args('page') page?: number,
    @Args('limit') limit?: number
  ): Promise<Video[]> {
    const variantLanguageId = info.fieldNodes[0].selectionSet.selections
      .find(({ name }) => name.value === 'variant')
      ?.arguments.find(({ name }) => name.value === 'languageId')?.value?.value
    return await this.videoService.filterAll({
      title: where?.title ?? undefined,
      availableVariantLanguageIds:
        where?.availableVariantLanguageIds ?? undefined,
      variantLanguageId,
      includePlaylists: where?.includePlaylists ?? undefined,
      includePlaylistVideos: where?.includePlaylistVideos ?? undefined,
      onlyPlaylists: where?.onlyPlaylists ?? undefined,
      page,
      limit
    })
  }

  @Query()
  async video(@Info() info, @Args('id') id: string): Promise<Video> {
    const variantLanguageId = info.fieldNodes[0].selectionSet.selections
      .find(({ name }) => name.value === 'variant')
      ?.arguments.find(({ name }) => name.value === 'languageId')?.value?.value
    return await this.videoService.getVideo(id, variantLanguageId)
  }

  @ResolveReference()
  async resolveReference(reference: {
    __typename: 'Video'
    id: string
    primaryLanguageId?: string | null
  }): Promise<Video> {
    return await this.videoService.getVideo(
      reference.id,
      reference.primaryLanguageId ?? undefined
    )
  }
}
