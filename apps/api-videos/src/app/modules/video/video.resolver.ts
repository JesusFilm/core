import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject } from '@nestjs/common'
import {
  Args,
  Info,
  Parent,
  Query,
  ResolveField,
  ResolveReference,
  Resolver
} from '@nestjs/graphql'
import { Cache } from 'cache-manager'
import { FieldNode, GraphQLError, GraphQLResolveInfo, Kind } from 'graphql'
import compact from 'lodash/compact'
import isEmpty from 'lodash/isEmpty'

import { Video, VideoTitle, VideoVariant } from '.prisma/api-videos-client'
import { TranslationField } from '@core/nest/decorators/TranslationField'

import { IdType, VideosFilter } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

import { VideoService } from './video.service'

@Resolver('Video')
export class VideoResolver {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly videoService: VideoService,
    private readonly prismaService: PrismaService
  ) {}

  @Query()
  async videos(
    @Info() info: GraphQLResolveInfo,
    @Args('where') where?: VideosFilter,
    @Args('offset') offset?: number,
    @Args('limit') limit?: number
  ): Promise<Video[]> {
    return await this.videoService.filterAll({
      title: where?.title ?? undefined,
      availableVariantLanguageIds:
        where?.availableVariantLanguageIds ?? undefined,
      ids: where?.ids ?? undefined,
      variantLanguageId: this.extractVariantLanguageId(info),
      labels: where?.labels ?? undefined,
      subtitleLanguageIds: where?.subtitleLanguageIds ?? undefined,
      offset,
      limit
    })
  }

  @Query()
  async video(
    @Info() info: GraphQLResolveInfo,
    @Args('id') id: string,
    @Args('idType') idType: IdType = IdType.databaseId
  ): Promise<Video> {
    let result: Video | null
    switch (idType) {
      case IdType.databaseId:
        result = await this.prismaService.video.findUnique({
          where: { id }
        })
        break
      case IdType.slug:
        result = await this.prismaService.video.findFirst({
          where: { variants: { some: { slug: id } } }
        })
        break
    }
    if (result == null)
      throw new GraphQLError('Video not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    return result
  }

  @ResolveReference()
  async resolveReference(reference: {
    __typename: 'Video'
    id: string
  }): Promise<Video | null> {
    return await this.prismaService.video.findUnique({
      where: { id: reference.id }
    })
  }

  @ResolveField()
  async children(@Parent() video): Promise<Video[] | null> {
    const key = `video-children-${video.id}`
    const cache = await this.cacheManager.get<Video[]>(key)
    if (cache != null) return cache

    const result = await this.prismaService.video.findMany({
      where: { id: { in: video.childIds } }
    })
    const sorted = video.childIds.map((id) =>
      result.find((video) => video.id === id)
    )

    await this.cacheManager.set(key, sorted, 86400000)
    return sorted
  }

  @ResolveField()
  async title(
    @Parent() video,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean
  ): Promise<VideoTitle[]> {
    return await this.prismaService.videoTitle.findMany({
      where: {
        videoId: video.id,
        OR: compact([
          primary != null
            ? {
                primary
              }
            : undefined,
          {
            languageId: languageId ?? '529'
          }
        ])
      }
    })
  }

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
  async childrenCount(@Parent() video): Promise<number> {
    return await this.prismaService.video.count({
      where: { parent: { some: { id: video.id } } }
    })
  }

  @ResolveField('variantLanguagesCount')
  async variantLanguagesCount(@Parent() video): Promise<number> {
    return await this.prismaService.videoVariant.count({
      where: { videoId: video.id }
    })
  }

  @ResolveField('variant')
  async variant(
    @Info() info: GraphQLResolveInfo,
    @Parent() video,
    @Args('languageId') languageId?: string
  ): Promise<VideoVariant | null> {
    const variableValueId =
      (info.variableValues.id as string) ??
      (info.variableValues.contentId as string) ??
      ''
    const requestedLanguage = variableValueId.includes('/')
      ? variableValueId.substring(variableValueId.lastIndexOf('/') + 1)
      : ''

    const journeysLanguageIdForBlock = (
      info.variableValues as {
        representations: Array<{ primaryLanguageId: string }>
      }
    ).representations?.[0].primaryLanguageId

    if (
      info.variableValues.idType !== IdType.databaseId &&
      !isEmpty(variableValueId) &&
      !isEmpty(requestedLanguage)
    ) {
      const slug = `${video.slug as string}/${requestedLanguage}`
      const key = `video-variant-slug-${slug}`
      const cache = await this.cacheManager.get<VideoVariant>(key)
      if (cache != null) return cache

      const results = await this.prismaService.videoVariant.findUnique({
        where: {
          slug
        }
      })

      await this.cacheManager.set(key, results, 86400000)
      return results
    }

    languageId = languageId ?? journeysLanguageIdForBlock ?? '529'
    const key = `video-variant-${video.id}-${languageId}`
    const cache = await this.cacheManager.get<VideoVariant>(key)
    if (cache != null) return cache

    const results = await this.prismaService.videoVariant.findUnique({
      where: {
        languageId_videoId: {
          videoId: video.id,
          languageId
        }
      }
    })
    await this.cacheManager.set(key, results, 86400000)
    return results
  }

  @ResolveField('variantLanguages')
  async variantLanguages(@Parent() video): Promise<Array<{ id: string }>> {
    const result = await this.prismaService.videoVariant.findMany({
      where: { videoId: video.id },
      select: { languageId: true }
    })
    return result.map(({ languageId }) => ({ id: languageId }))
  }

  @ResolveField('variantLanguagesWithSlug')
  async variantLanguagesWithSlug(
    @Parent() video
  ): Promise<Array<{ slug: string; languageId: string }>> {
    const result = await this.prismaService.videoVariant.findMany({
      where: { videoId: video.id },
      select: { languageId: true, slug: true }
    })
    return result.map(({ slug, languageId }) => ({ slug, languageId }))
  }

  private extractVariantLanguageId(
    info: GraphQLResolveInfo
  ): string | undefined {
    const argumentNode = (
      info.fieldNodes[0].selectionSet?.selections.find(
        (node) => node.kind === Kind.FIELD && node.name.value === 'variant'
      ) as FieldNode | undefined
    )?.arguments?.find(({ name }) => name.value === 'languageId')

    let variantLanguageId: string | undefined
    const valueNode = argumentNode?.value
    if (valueNode != null && 'value' in valueNode) {
      variantLanguageId = valueNode.value.toString()
    }
    if (valueNode != null && valueNode.kind === Kind.VARIABLE) {
      variantLanguageId = info.variableValues[valueNode.name.value] as string
    }
    return variantLanguageId
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
