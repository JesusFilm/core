import { BaseService } from '@core/nest/database/BaseService'
import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { DocumentCollection } from 'arangojs/collection'
import { KeyAsId } from '@core/nest/decorators/KeyAsId'
import { AqlQuery, GeneratedAqlQuery } from 'arangojs/aql'
import { VideosFilter } from '../../__generated__/graphql'

interface ExtendedVideosFilter extends VideosFilter {
  variantLanguageId?: string
  offset?: number
  limit?: number
}

@Injectable()
export class VideoService extends BaseService {
  collection: DocumentCollection = this.db.collection('videos')
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
        variantLanguages: item.variants[* RETURN { id : CURRENT.languageId }],`
  ]

  videosView = this.db.view('videosView')

  public videoFilter(filter?: VideosFilter): AqlQuery {
    const {
      title,
      availableVariantLanguageIds = [],
      labels = null
    } = filter ?? {}

    return aql.join(
      [
        (title != null || (availableVariantLanguageIds?.length ?? 0) > 0) &&
          aql`SEARCH`,
        title != null &&
          aql`ANALYZER(TOKENS(${title}, "text_en") ALL == item.title.value, "text_en")`,
        title != null &&
          (availableVariantLanguageIds?.length ?? 0) > 0 &&
          aql`AND`,
        (availableVariantLanguageIds?.length ?? 0) > 0 &&
          aql`item.variants.languageId IN ${availableVariantLanguageIds}`,
        labels != null && aql`FILTER item.label IN ${labels}`
      ].filter((x) => x !== false)
    )
  }

  @KeyAsId()
  public async filterAll<T>(filter?: ExtendedVideosFilter): Promise<T[]> {
    const { variantLanguageId, offset = 0, limit = 100 } = filter ?? {}
    const search = this.videoFilter(filter)

    const res = await this.db.query(aql`
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
    `)
    return await res.all()
  }

  @KeyAsId()
  public async getVideo<T>(
    _key: string,
    variantLanguageId?: string
  ): Promise<T> {
    const res = await this.db.query(aql`
    FOR item in ${this.videosView}
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
    `)
    return await res.next()
  }

  @KeyAsId()
  public async getVideoBySlug<T>(slug: string): Promise<T> {
    const res = await this.db.query(aql`
    FOR item IN ${this.videosView}
      FILTER ${slug} IN item.variants[*].slug
      LIMIT 1
      RETURN {
        ${aql.join(this.baseVideo)}
        variant: NTH(item.variants[*
          FILTER CURRENT.slug == ${slug}
          LIMIT 1 RETURN CURRENT], 0)
      }
    `)
    return await res.next()
  }

  @KeyAsId()
  public async getVideosByIds<T>(
    keys: string[],
    variantLanguageId?: string
  ): Promise<T[]> {
    const res = await this.db.query(aql`
    FOR item IN ${this.videosView}
      FILTER item._key IN ${keys}
      RETURN {
        ${aql.join(this.baseVideo)}
        variant: NTH(item.variants[*
          FILTER CURRENT.languageId == NOT_NULL(${
            variantLanguageId ?? null
          }, item.primaryLanguageId)
          LIMIT 1 RETURN CURRENT], 0)
      }
    `)
    return await res.all()
  }
}
