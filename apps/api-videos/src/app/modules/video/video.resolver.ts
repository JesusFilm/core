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

import {
  BibleCitation,
  Keyword,
  Prisma,
  Video,
  VideoDescription,
  VideoImageAlt,
  VideoSnippet,
  VideoStudyQuestion,
  VideoSubtitle,
  VideoTitle,
  VideoVariant
} from '.prisma/api-videos-client'

import { PrismaService } from '../../lib/prisma.service'

import { VideoService } from './video.service'

const ONE_DAY_MS = 86400000

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
  async children(@Parent() video: Video): Promise<Video[]> {
    const key = `video-children-${video.id}`
    const cache = await this.cacheManager.get<Video[]>(key)
    if (cache != null) {
      return cache
    }

    const result =
      (await this.prismaService.video
        .findUnique({
          where: { id: video.id }
        })
        .children()) ?? []

    const sorted = compact(
      video.childIds.map((id) => result.find((video) => video.id === id))
    )

    await this.cacheManager.set(key, sorted, ONE_DAY_MS)
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
  async description(
    @Parent() video,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean
  ): Promise<VideoDescription[]> {
    return await this.prismaService.videoDescription.findMany({
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
  async snippet(
    @Parent() video,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean
  ): Promise<VideoSnippet[]> {
    return await this.prismaService.videoSnippet.findMany({
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
  async imageAlt(
    @Parent() video,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean
  ): Promise<VideoImageAlt[]> {
    return await this.prismaService.videoImageAlt.findMany({
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
  async studyQuestions(
    @Parent() video,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean
  ): Promise<VideoStudyQuestion[]> {
    return await this.prismaService.videoStudyQuestion.findMany({
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
      },
      orderBy: { order: 'asc' }
    })
  }

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

      await this.cacheManager.set(key, results, ONE_DAY_MS)
      return results
    }

    languageId = languageId ?? journeysLanguageIdForBlock ?? '529'
    const key = `video-variant-${video.id as string}-${languageId}`
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
    await this.cacheManager.set(key, results, ONE_DAY_MS)
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

  @ResolveField('bibleCitations')
  async bibleCitations(@Parent() video): Promise<BibleCitation[]> {
    return await this.prismaService.bibleCitation.findMany({
      where: { videoId: video.id },
      orderBy: { order: 'asc' }
    })
  }

  @ResolveField('subtitles')
  async subtitles(
    @Parent() video,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean,
    @Args('edition') edition?: string
  ): Promise<VideoSubtitle[]> {
    const where: Prisma.VideoSubtitleWhereInput = {
      videoId: video.id,
      OR:
        languageId == null && primary == null && edition == null
          ? undefined
          : [
              {
                languageId: languageId ?? undefined
              },
              {
                primary: primary ?? undefined
              },
              {
                edition: edition ?? undefined
              }
            ]
    }
    return await this.prismaService.videoSubtitle.findMany({
      where,
      orderBy: { primary: 'desc' }
    })
  }

  @ResolveField('keywords')
  async keywords(
    @Parent() video,
    @Args('languageId') languageId?: string
  ): Promise<Keyword[]> {
    return await this.prismaService.keyword.findMany({
      where: { videos: { some: { id: video.id } }, languageId }
    })
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
