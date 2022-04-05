import { BaseService } from '@core/nest/database'
import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { DocumentCollection } from 'arangojs/collection'
import { KeyAsId } from '@core/nest/decorators'

interface VideosFilter {
  title?: string
  availableVariantLanguageIds?: string[]
  variantLanguageId?: string
  offset?: number
  limit?: number
}
@Injectable()
export class VideoService extends BaseService {
  collection: DocumentCollection = this.db.collection('videos')

  @KeyAsId()
  async filterAll<T>(filter?: VideosFilter): Promise<T[]> {
    const {
      title,
      availableVariantLanguageIds = [],
      variantLanguageId,
      offset = 0,
      limit = 100
    } = filter ?? {}
    const videosView = this.db.view('videosView')
    const search = aql.join(
      [
        (title != null || availableVariantLanguageIds.length > 0) &&
          aql`SEARCH`,
        title != null &&
          aql`ANALYZER(TOKENS(${title}, "text_en") ALL == item.title.value, "text_en")`,
        title != null && availableVariantLanguageIds.length > 0 && aql`AND`,
        availableVariantLanguageIds.length > 0 &&
          aql`item.variants.languageId IN ${availableVariantLanguageIds}`
      ].filter((x) => x !== false)
    )
    const res = await this.db.query(aql`
    FOR item IN ${videosView}
      ${search}
      LIMIT ${offset}, ${limit}
      RETURN {
        _key: item._key,
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
        _key: item._key,
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
        variantLanguages: item.variants[* RETURN { id : CURRENT.languageId }]
      }
    `)
    return await res.next()
  }
}
