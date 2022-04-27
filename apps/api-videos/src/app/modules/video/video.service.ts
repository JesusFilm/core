import { BaseService } from '@core/nest/database'
import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { DocumentCollection } from 'arangojs/collection'
import { KeyAsId } from '@core/nest/decorators'
import { AqlQuery } from 'arangojs/aql'
import { IdType, VideoType } from '../../__generated__/graphql'

interface VideosFilter {
  title?: string
  tagId?: string
  availableVariantLanguageIds?: string[]
  variantLanguageId?: string
  types?: VideoType[]
  offset?: number
  limit?: number
}

interface EpisodesFilter extends VideosFilter {
  playlistId: string
  idType: IdType.databaseId | IdType.slug
}
@Injectable()
export class VideoService extends BaseService {
  collection: DocumentCollection = this.db.collection('videos')

  videoFilter(filter?: EpisodesFilter | VideosFilter): AqlQuery {
    const {
      title,
      tagId = null,
      availableVariantLanguageIds = [],
      types = null
    } = filter ?? {}

    return aql.join(
      [
        (title != null || availableVariantLanguageIds.length > 0) &&
          aql`SEARCH`,
        title != null &&
          aql`ANALYZER(TOKENS(${title}, "text_en") ALL == item.title.value, "text_en")`,
        title != null && availableVariantLanguageIds.length > 0 && aql`AND`,
        availableVariantLanguageIds.length > 0 &&
          aql`item.variants.languageId IN ${availableVariantLanguageIds}`,
        types != null && aql`FILTER item.type IN ${types}`,
        tagId != null && aql`FILTER ${tagId} IN item.tagIds`
      ].filter((x) => x !== false)
    )
  }

  @KeyAsId()
  async filterEpisodes<T>(filter?: EpisodesFilter): Promise<T[]> {
    const {
      playlistId,
      idType,
      variantLanguageId,
      offset = 0,
      limit = 100
    } = filter ?? {}
    const videosView = this.db.view('videosView')
    const search = this.videoFilter(filter)
    const idFilter =
      idType === IdType.databaseId
        ? aql`FILTER video._key == ${playlistId}`
        : aql`FILTER video.permalink == ${playlistId}`

    const res = await this.db.query(aql`
    FOR video IN ${this.collection}
      ${idFilter}
      LIMIT 1
      FOR item IN ${videosView}
        FILTER item._key IN video.episodeIds
        ${search}
        LIMIT ${offset}, ${limit}
        RETURN {
          _key: item._key,
          type: item.type,
          title: item.title,
          snippet: item.snippet,
          description: item.description,
          studyQuestions: item.studyQuestions,
          image: item.image,
          tagIds: item.tagIds,
          primaryLanguageId: item.primaryLanguageId,
          variant: NTH(item.variants[* 
            FILTER CURRENT.languageId == NOT_NULL(${
              variantLanguageId ?? null
            }, item.primaryLanguageId)
            LIMIT 1 RETURN CURRENT
          ], 0),
          variantLanguages: item.variants[* RETURN { id : CURRENT.languageId }],
          episodeIds: item.episodeIds,
          permalink: item.permalink,
          noIndex: item.noIndex,
          seoTitle: item.seoTitle,
          imageAlt: item.imageAlt
        }
    `)
    return await res.all()
  }

  @KeyAsId()
  async filterAll<T>(filter?: VideosFilter): Promise<T[]> {
    const { variantLanguageId, offset = 0, limit = 100 } = filter ?? {}
    const videosView = this.db.view('videosView')
    const search = this.videoFilter(filter)

    const res = await this.db.query(aql`
    FOR item IN ${videosView}
      ${search}
      LIMIT ${offset}, ${limit}
      RETURN {
        _key: item._key,
        type: item.type,
        title: item.title,
        snippet: item.snippet,
        description: item.description,
        studyQuestions: item.studyQuestions,
        image: item.image,
        tagIds: item.tagIds,
        primaryLanguageId: item.primaryLanguageId,
        variant: NTH(item.variants[* 
          FILTER CURRENT.languageId == NOT_NULL(${
            variantLanguageId ?? null
          }, item.primaryLanguageId)
          LIMIT 1 RETURN CURRENT
        ], 0),
        variantLanguages: item.variants[* RETURN { id : CURRENT.languageId }],
        episodeIds: item.episodeIds,
        permalink: item.permalink,
        noIndex: item.noIndex,
        seoTitle: item.seoTitle,
        imageAlt: item.imageAlt
      }
    `)
    return await res.all()
  }

  @KeyAsId()
  async getVideo<T>(_key: string, variantLanguageId?: string): Promise<T> {
    const res = await this.db.query(aql`
    FOR item in ${this.collection}
      FILTER item._key == ${_key}
      LIMIT 1
      RETURN {
        _key: item._key,
        type: item.type,
        title: item.title,
        snippet: item.snippet,
        description: item.description,
        studyQuestions: item.studyQuestions,
        image: item.image,
        tagIds: item.tagIds,
        primaryLanguageId: item.primaryLanguageId,
        variant: NTH(item.variants[* 
          FILTER CURRENT.languageId == NOT_NULL(${
            variantLanguageId ?? null
          }, item.primaryLanguageId)
          LIMIT 1 RETURN CURRENT], 0),
        variantLanguages: item.variants[* RETURN { id : CURRENT.languageId }        
        ],
        episodeIds: item.episodeIds,
        permalink: item.permalink,
        noIndex: item.noIndex,
        seoTitle: item.seoTitle,
        imageAlt: item.imageAlt
      }
    `)
    return await res.next()
  }

  @KeyAsId()
  async getVideoByPermalink<T>(
    permalink: string,
    variantLanguageId?: string
  ): Promise<T> {
    const res = await this.db.query(aql`
    FOR item in ${this.collection}
      FILTER item.permalink == ${permalink}
      LIMIT 1
      RETURN {
        _key: item._key,
        type: item.type,
        title: item.title,
        snippet: item.snippet,
        description: item.description,
        studyQuestions: item.studyQuestions,
        image: item.image,
        tagIds: item.tagIds,
        playlist: item.playlist,
        variant: NTH(item.variants[* 
          FILTER CURRENT.languageId == NOT_NULL(${
            variantLanguageId ?? null
          }, item.primaryLanguageId)
          LIMIT 1 RETURN CURRENT], 0),
        variantLanguages: item.variants[* RETURN { id : CURRENT.languageId }        
        ],
        episodeIds: item.episodeIds,
        permalink: item.permalink,
        noIndex: item.noIndex,
        seoTitle: item.seoTitle,
        imageAlt: item.imageAlt
      }
    `)
    return await res.next()
  }

  @KeyAsId()
  async getVideosByIds<T>(
    keys: string[],
    variantLanguageId?: string
  ): Promise<T[]> {
    const videosView = this.db.view('videosView')
    const res = await this.db.query(aql`
    FOR item IN ${videosView}
      FILTER item._key IN ${keys}
      RETURN {
        _key: item._key,
        type: item.type,
        title: item.title,
        snippet: item.snippet,
        description: item.description,
        studyQuestions: item.studyQuestions,
        image: item.image,
        tagIds: item.tagIds,
        primaryLanguageId: item.primaryLanguageId,
        variant: NTH(item.variants[* 
          FILTER CURRENT.languageId == NOT_NULL(${
            variantLanguageId ?? null
          }, item.primaryLanguageId)
          LIMIT 1 RETURN CURRENT], 0),
        variantLanguages: item.variants[* RETURN { id : CURRENT.languageId }],
        episodeIds: item.episodeIds,
        permalink: item.permalink,
        noIndex: item.noIndex,
        seoTitle: item.seoTitle,
        imageAlt: item.imageAlt
      }
    `)
    return await res.all()
  }
}
