import { TranslationField } from '@core/nest/decorators/TranslationField'
import {
  Resolver,
  Query,
  Args,
  Info,
  ResolveReference,
  ResolveField,
  Parent
} from '@nestjs/graphql'

import { IdType, Video, VideosFilter } from '../../__generated__/graphql'
import { VideoService } from './video.service'

@Resolver('Video')
export class VideoResolver {
  constructor(private readonly videoService: VideoService) {}

  @Query('episodes')
  async episodesQuery(
    @Info() info,
    @Args('playlistId') id: string,
    @Args('idType') idType: IdType = IdType.databaseId,
    @Args('where') where?: VideosFilter,
    @Args('offset') offset?: number,
    @Args('limit') limit?: number
  ): Promise<Video[]> {
    const variantLanguageId = info.fieldNodes[0].selectionSet.selections
      .find(({ name }) => name.value === 'variant')
      ?.arguments.find(({ name }) => name.value === 'languageId')?.value?.value
    return await this.videoService.filterChildren({
      id,
      idType,
      title: where?.title ?? undefined,
      availableVariantLanguageIds:
        where?.availableVariantLanguageIds ?? undefined,
      variantLanguageId,
      types: where?.types ?? undefined,
      labels: where?.labels ?? undefined,
      offset,
      limit
    })
  }

  @Query()
  async videos(
    @Info() info,
    @Args('where') where?: VideosFilter,
    @Args('offset') offset?: number,
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
      types: where?.types ?? undefined,
      labels: where?.labels ?? undefined,
      offset,
      limit
    })
  }

  @Query()
  async video(
    @Info() info,
    @Args('id') id: string,
    @Args('idType') idType: IdType = IdType.databaseId
  ): Promise<Video> {
    const variantLanguageId = info.fieldNodes[0].selectionSet.selections
      .find(({ name }) => name.value === 'variant')
      ?.arguments.find(({ name }) => name.value === 'languageId')?.value?.value
    return idType === IdType.databaseId
      ? await this.videoService.getVideo(id, variantLanguageId)
      : await this.videoService.getVideoBySlug(id, variantLanguageId)
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

  @ResolveField()
  async episodes(
    @Parent() video: Video & { childIds: string[] }
  ): Promise<Video[] | null> {
    return await this.children(video)
  }

  @ResolveField()
  async children(
    @Parent() video: Video & { childIds: string[] }
  ): Promise<Video[] | null> {
    return video.childIds != null
      ? await this.videoService.getVideosByIds(video.childIds)
      : null
  }

  @ResolveField()
  @TranslationField('title')
  title(
    @Parent() language,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean
  ): void {}

  @ResolveField()
  @TranslationField('seoTitle')
  seoTitle(
    @Parent() language,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean
  ): void {}

  @ResolveField()
  @TranslationField('snippet')
  snippet(
    @Parent() language,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean
  ): void {}

  @ResolveField()
  @TranslationField('description')
  description(
    @Parent() language,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean
  ): void {}

  @ResolveField()
  @TranslationField('studyQuestions')
  studyQuestions(
    @Parent() language,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean
  ): void {}

  @ResolveField()
  @TranslationField('imageAlt')
  imageAlt(
    @Parent() language,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean
  ): void {}

  @ResolveField()
  @TranslationField('slug')
  slug(
    @Parent() language,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean
  ): void {}
}
