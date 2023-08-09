import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common'
import { Database, aql } from 'arangojs'
import { AqlQuery, GeneratedAqlQuery } from 'arangojs/aql'
import { Cache } from 'cache-manager'
import { DeepMockProxy } from 'jest-mock-extended'
import compact from 'lodash/compact'

import { BaseService } from '@core/nest/database/BaseService'
import { KeyAsId } from '@core/nest/decorators/KeyAsId'

import { VideosFilter } from '../../__generated__/graphql'

interface ExtendedVideosFilter extends VideosFilter {
  variantLanguageId?: string
  offset?: number
  limit?: number
}

@Injectable()
export class VideoService extends BaseService {
  collection = this.db.collection('videos')
  baseVideo: GeneratedAqlQuery[] = [
    aql`_key: item._key,
        label: item.label,
        title: item.title,
        snippet: item.snippet,
        description: item.description,
        studyQuestions: item.studyQuestions,
        image: item.image,
        primaryLanguageId: item.primaryLanguageId,
        childIds: item.childIds,
        slug: item.slug,
        noIndex: item.noIndex,
        seoTitle: item.seoTitle,
        imageAlt: item.imageAlt,
        variantLanguages: item.variants[* RETURN { id : CURRENT.languageId }],
        variantLanguagesWithSlug: item.variants[* RETURN {slug: CURRENT.slug, languageId: CURRENT.languageId}],`
  ]

  videosView = this.db.view('videosView')

  constructor(
    @Inject('DATABASE') public readonly db: Database | DeepMockProxy<Database>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {
    super(db)
  }

  public videoFilter(filter: VideosFilter = {}): AqlQuery {
    const {
      title,
      availableVariantLanguageIds,
      labels,
      ids,
      subtitleLanguageIds
    } = filter

    if (
      title == null &&
      availableVariantLanguageIds == null &&
      labels == null &&
      ids == null &&
      subtitleLanguageIds == null
    )
      return aql``

    return aql`
      SEARCH ${aql.join(
        compact([
          title != null &&
            aql`ANALYZER(TOKENS(${title}, "text_en") ALL == item.title.value, "text_en")`,
          availableVariantLanguageIds != null &&
            aql`item.variants.languageId IN ${availableVariantLanguageIds}`,
          labels != null && aql`item.label IN ${labels}`,
          ids != null && aql`item._key IN ${ids}`,
          subtitleLanguageIds != null &&
            aql`item.variants.subtitle.languageId IN ${subtitleLanguageIds}`
        ]),
        ' AND '
      )}
    `
  }

  @KeyAsId()
  public async filterAll<T>(filter?: ExtendedVideosFilter): Promise<T[]> {
    const key = `filterAll-${JSON.stringify({ filter })}`
    const cache = await this.cacheManager.get<T[]>(key)
    if (cache != null) return cache

    const { variantLanguageId, offset = 0, limit = 100 } = filter ?? {}
    const search = this.videoFilter(filter)

    const query = aql`
    FOR item IN ${this.videosView}
      ${search}
      LIMIT ${offset}, ${limit}
      RETURN {
        ${aql.join(this.baseVideo)}
        variant: NTH(item.variants[* 
          FILTER CURRENT.languageId == NOT_NULL(${
            variantLanguageId ?? null
          }, item.primaryLanguageId)
          LIMIT 1 RETURN CURRENT
        ], 0)
      }
    `
    const res = await this.db.query(query)
    const result = await res.all()
    await this.cacheManager.set(key, result, 86400000)
    return result
  }

  private getVideoByIdAql(_key: string, variantLanguageId?: string): AqlQuery {
    return aql`
    FOR item in ${this.collection}
      FILTER item._key == ${_key}
      LIMIT 1
      RETURN {
        ${aql.join(this.baseVideo)}
        variant: NTH(item.variants[* 
          FILTER CURRENT.languageId == NOT_NULL(${
            variantLanguageId ?? null
          }, item.primaryLanguageId)
          LIMIT 1 RETURN CURRENT], 0)
      }
    `
  }

  @KeyAsId()
  public async getVideo<T>(
    _key: string,
    variantLanguageId?: string
  ): Promise<T> {
    const key = `getVideo-${_key}-${variantLanguageId ?? ''}`
    const cache = await this.cacheManager.get<T>(key)
    if (cache != null) return cache

    const res = await this.db.query(
      this.getVideoByIdAql(_key, variantLanguageId)
    )
    const result = await res.next()
    if (result != null) await this.cacheManager.set(key, result, 86400000)
    return result
  }

  @KeyAsId()
  public async getVideoBySlug<T>(slug: string): Promise<T> {
    const key = `getVideoBySlug-${slug}`
    const cache = await this.cacheManager.get<T>(key)
    if (cache != null) return cache

    const res = await this.db.query(aql`
    FOR item IN ${this.collection}
      FILTER ${slug} IN item.variants[*].slug
      LIMIT 1
      RETURN {
        ${aql.join(this.baseVideo)}
        variant: NTH(item.variants[*
          FILTER CURRENT.slug == ${slug}
          LIMIT 1 RETURN CURRENT], 0)
      }
    `)
    const result = await res.next()
    if (result != null) await this.cacheManager.set(key, result, 86400000)
    return result
  }

  @KeyAsId()
  public async getVideosByIds<T>(
    keys: string[],
    variantLanguageId?: string
  ): Promise<T[]> {
    const result: T[] = []
    for (let i = 0; i < keys.length; i++) {
      const key = `getVideo-${keys[i]}-${variantLanguageId ?? ''}`
      const cache = await this.cacheManager.get<T>(key)
      if (cache != null) {
        result.push(cache)
        continue
      }
      const res = await this.db.query(
        this.getVideoByIdAql(keys[i], variantLanguageId)
      )
      const next = await res.next()
      await this.cacheManager.set(key, next, 86400000)
      result.push(next)
    }
    return result
  }
}
