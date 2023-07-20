import { Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { Prisma, Video } from '.prisma/api-videos-client'
import { VideosFilter } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

interface ExtendedVideosFilter extends VideosFilter {
  variantLanguageId?: string
  offset?: number
  limit?: number
}

@Injectable()
export class VideoService {
  constructor(
    private readonly cacheManager: Cache,
    private readonly prismaService: PrismaService
  ) {}

  public videoFilter(filter: VideosFilter = {}): Prisma.VideoWhereInput {
    const {
      title,
      availableVariantLanguageIds,
      labels,
      ids,
      subtitleLanguageIds
    } = filter

    return {
      title: title != null ? { some: { value: { search: title } } } : undefined,
      variants:
        availableVariantLanguageIds != null || subtitleLanguageIds != null
          ? {
              some: {
                subtitle:
                  subtitleLanguageIds != null
                    ? { has: { path: ['languageId'], in: subtitleLanguageIds } }
                    : undefined,
                languageId:
                  availableVariantLanguageIds != null
                    ? { in: availableVariantLanguageIds }
                    : undefined
              }
            }
          : undefined,
      label: labels != null ? { in: labels } : undefined,
      id: ids != null ? { in: ids } : undefined
    }
  }

  public async filterAll(filter?: ExtendedVideosFilter): Promise<Video[]> {
    const key = `filterAll-${JSON.stringify({ filter })}`
    const cache = await this.cacheManager.get<Video[]>(key)
    if (cache != null) return cache

    const { offset = 0, limit = 100 } = filter ?? {}
    const search = this.videoFilter(filter)

    const result = await this.prismaService.video.findMany({
      where: search,
      skip: offset,
      take: limit
    })
    await this.cacheManager.set(key, result, 86400000)
    return result
  }

  public async getVideo(
    id: string,
    variantLanguageId?: string
  ): Promise<Video | null> {
    const key = `getVideo-${id}-${variantLanguageId ?? ''}`
    const cache = await this.cacheManager.get<Video>(key)
    if (cache != null) return cache

    const result = await this.prismaService.video.findUnique({
      where: { id }
    })

    if (result != null) await this.cacheManager.set(key, result, 86400000)
    return result
  }

  public async getVideoBySlug(slug: string): Promise<Video | null> {
    const key = `getVideoBySlug-${slug}`
    const cache = await this.cacheManager.get<Video>(key)
    if (cache != null) return cache

    const result = await this.prismaService.video.findFirst({
      where: { variants: { some: { slug } } }
    })

    if (result != null) await this.cacheManager.set(key, result, 86400000)
    return result
  }

  public async getVideosByIds(
    ids: string[],
    variantLanguageId?: string
  ): Promise<Video[]> {
    const result: Video[] = []
    for (let i = 0; i < ids.length; i++) {
      const key = `getVideo-${ids[i]}-${variantLanguageId ?? ''}`
      const cache = await this.cacheManager.get<Video>(key)
      if (cache != null) {
        result.push(cache)
        continue
      }

      const next = await this.prismaService.video.findUnique({
        where: { id: ids[i] }
      })

      await this.cacheManager.set(key, next, 86400000)
      if (next != null) result.push(next)
    }
    return result
  }
}
