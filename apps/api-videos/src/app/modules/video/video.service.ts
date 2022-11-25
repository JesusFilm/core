import { BaseService } from '@core/nest/database/BaseService'
import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { DocumentCollection } from 'arangojs/collection'
import { KeyAsId } from '@core/nest/decorators/KeyAsId'
import { AqlQuery, GeneratedAqlQuery } from 'arangojs/aql'
import { UserInputError } from 'apollo-server-errors'
import { IdType, VideosFilter } from '../../__generated__/graphql'

interface ExtendedVideosFilter extends VideosFilter {
  variantLanguageId?: string
  offset?: number
  limit?: number
}

interface EpisodesFilter extends ExtendedVideosFilter {
  playlistId: string
  idType: IdType
}
@Injectable()
export class VideoService extends BaseService {
  collection: DocumentCollection = this.db.collection('videos')

  baseVideo: GeneratedAqlQuery[] = [
    aql`_key: item._key,
        type: item.type,
        title: item.title,
        snippet: item.snippet,
        description: item.description,
        studyQuestions: item.studyQuestions,
        image: item.image,
        tagIds: item.tagIds,
        episodeIds: item.episodeIds,
        slug: item.slug,
        noIndex: item.noIndex,
        seoTitle: item.seoTitle,
        imageAlt: item.imageAlt,`
  ]

  videoFilter(filter?: VideosFilter): AqlQuery {
    const {
      title,
      tagId = null,
      availableVariantLanguageIds = [],
      types = null
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

    let idFilter
    const variantFilter: GeneratedAqlQuery[] = []
    switch (idType) {
      case IdType.databaseId:
        idFilter = aql`FILTER video._key == ${playlistId}`
        variantFilter.push(aql`variant: NTH(item.variants[* 
          FILTER CURRENT.languageId == NOT_NULL(${
            variantLanguageId ?? null
          }, item.primaryLanguageId)
          LIMIT 1 RETURN CURRENT
        ], 0),`)
        break
      case IdType.slug:
        idFilter = aql`FILTER ${playlistId} IN item.variants[*].path`
        variantFilter.push(aql` variant: NTH(item.variants[*
          FILTER CURRENT.path == ${playlistId}
          LIMIT 1 RETURN CURRENT], 0),`)
        break
    }
    if (idFilter == null || variantFilter == null) {
      throw new UserInputError('Incorrect video id type')
    }

    const res = await this.db.query(aql`
    FOR video IN ${this.collection}
      ${idFilter}
      LIMIT 1
      FOR item IN ${videosView}
        FILTER item._key IN video.episodeIds
        ${search}
        LIMIT ${offset}, ${limit}
        RETURN {
          ${aql.join(this.baseVideo)}
          primaryLanguageId: item.primaryLanguageId,
          ${aql.join(variantFilter)}
          variantLanguages: item.variants[* RETURN { id : CURRENT.languageId }]
        }
    `)
    return await res.all()
  }

  @KeyAsId()
  async filterAll<T>(filter?: ExtendedVideosFilter): Promise<T[]> {
    const { variantLanguageId, offset = 0, limit = 100 } = filter ?? {}
    const videosView = this.db.view('videosView')
    const search = this.videoFilter(filter)

    const res = await this.db.query(aql`
    FOR item IN ${videosView}
      ${search}
      LIMIT ${offset}, ${limit}
      RETURN {
        ${aql.join(this.baseVideo)}
        primaryLanguageId: item.primaryLanguageId,
        variant: NTH(item.variants[* 
          FILTER CURRENT.languageId == NOT_NULL(${
            variantLanguageId ?? null
          }, item.primaryLanguageId)
          LIMIT 1 RETURN CURRENT
        ], 0),
        variantLanguages: item.variants[* RETURN { id : CURRENT.languageId }]
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
        ${aql.join(this.baseVideo)}
        primaryLanguageId: item.primaryLanguageId,
        variant: NTH(item.variants[* 
          FILTER CURRENT.languageId == NOT_NULL(${
            variantLanguageId ?? null
          }, item.primaryLanguageId)
          LIMIT 1 RETURN CURRENT], 0),
        variantLanguages: item.variants[* RETURN { id : CURRENT.languageId }]
      }
    `)
    return await res.next()
  }

  @KeyAsId()
  async getVideoBySlug<T>(slug: string): Promise<T> {
    const res = await this.db.query(aql`
    FOR item IN ${this.collection}
      FILTER ${slug} IN item.variants[*].path
      LIMIT 1
      RETURN {
        ${aql.join(this.baseVideo)}
        playlist: item.playlist,
        variant: NTH(item.variants[*
          FILTER CURRENT.path == ${slug}
          LIMIT 1 RETURN CURRENT], 0),
        variantLanguages: item.variants[* RETURN { id : CURRENT.languageId }]
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
        ${aql.join(this.baseVideo)}
        primaryLanguageId: item.primaryLanguageId,
        variant: NTH(item.variants[* 
          FILTER CURRENT.languageId == NOT_NULL(${
            variantLanguageId ?? null
          }, item.primaryLanguageId)
          LIMIT 1 RETURN CURRENT], 0),
        variantLanguages: item.variants[* RETURN { id : CURRENT.languageId }]
      }
    `)
    return await res.all()
  }
}
