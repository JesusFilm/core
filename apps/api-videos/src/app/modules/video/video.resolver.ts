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
import { compact } from 'lodash'

import { IdType, Video, VideosFilter } from '../../__generated__/graphql'
import { VideoService } from './video.service'

@Resolver('Video')
export class VideoResolver {
  constructor(private readonly videoService: VideoService) {}

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
      ids: where?.ids ?? undefined,
      variantLanguageId,
      labels: where?.labels ?? undefined,
      subtitleLanguageIds: where?.subtitleLanguageIds ?? undefined,
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

    switch (idType) {
      case IdType.databaseId:
        return await this.videoService.getVideo(id, variantLanguageId)
      case IdType.slug:
        return await this.videoService.getVideoBySlug(id)
    }
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
  async children(
    @Parent()
    video: {
      childIds?: string[]
      variant?: { languageId: string }
    }
  ): Promise<Video[] | null> {
    return video.childIds != null
      ? await this.videoService.getVideosByIds(
          video.childIds,
          video.variant?.languageId
        )
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
  childrenCount(@Parent() video): number {
    return compact(video.childIds).length
  }

  @ResolveField('variantLanguagesCount')
  variantLanguagesCount(@Parent() video): number {
    return compact(video.variantLanguages).length
  }
}

@Resolver('LanguageWithSlug')
export class LanguageWithSlugResolver {
  @ResolveField('language')
  language(@Parent() languageWithSlug): { __typename: 'Language'; id: string } {
    // 529 (english) is default if not set
    return { __typename: 'Language', id: languageWithSlug.languageId ?? '529' }
  }
}
