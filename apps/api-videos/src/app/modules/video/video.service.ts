import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { graphql } from 'gql.tada'

import { Prisma, Video } from '.prisma/api-videos-client'

import { PrismaService } from '../../lib/prisma.service'

type VideosFilter = ReturnType<typeof graphql.scalar<'VideosFilter'>>

interface ExtendedVideosFilter extends VideosFilter {
  variantLanguageId?: string
  offset?: number
  limit?: number
}

@Injectable()
export class VideoService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly prismaService: PrismaService
  ) {}

  public parseFullTextSearch(value: string): string {
    // Regular expression to match special characters in tsquery
    const specialChars = /[&|!():/-\s]/g

    const words = value.trim().split(/\s+/)

    const processedWords = words.map((word) => {
      if (specialChars.test(word)) {
        return `"${word.replace(specialChars, '\\$&')}"`
      }

      return word
    })

    return processedWords.join(' & ')
  }

  public videoFilter(filter: VideosFilter = {}): Prisma.VideoWhereInput {
    const {
      title,
      availableVariantLanguageIds,
      labels,
      ids,
      subtitleLanguageIds
    } = filter

    return {
      title:
        title != null
          ? { some: { value: { search: this.parseFullTextSearch(title) } } }
          : undefined,
      variants:
        availableVariantLanguageIds != null || subtitleLanguageIds != null
          ? {
              some: {
                subtitle:
                  subtitleLanguageIds != null
                    ? { some: { languageId: { in: subtitleLanguageIds } } }
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
}
