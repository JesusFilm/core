import { Test, TestingModule } from '@nestjs/testing'
import { mockDbQueryResult } from '@core/nest/database/mock'
import { Database, aql } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { DocumentCollection } from 'arangojs/collection'
import { ArrayCursor } from 'arangojs/cursor'
import { AqlQuery, GeneratedAqlQuery } from 'arangojs/aql'
import { VideoService } from './video.service'

const baseVideo: GeneratedAqlQuery[] = [
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

const DEFAULT_QUERY = aql`
    FOR item IN 
      
      LIMIT ${0}, ${100}
      RETURN {
        ${aql.join(baseVideo)}
        variant: NTH(item.variants[* 
          FILTER CURRENT.languageId == NOT_NULL(${null}, item.primaryLanguageId)
          LIMIT 1 RETURN CURRENT
        ], 0)
      }
    `.query

const VIDEO_CHILDREN_QUERY = aql`
    FOR item IN undefined
      FILTER item._key IN @value0
      RETURN {
        ${aql.join(baseVideo)}
        variant: NTH(item.variants[*
          FILTER CURRENT.languageId == NOT_NULL(@value1, item.primaryLanguageId)
          LIMIT 1 RETURN CURRENT], 0)
      }
    `.query

const GET_VIDEO_BY_SLUG_QUERY = aql`
    FOR item IN undefined
      FILTER @value0 IN item.variants[*].slug
      LIMIT 1
      RETURN {
        ${aql.join(baseVideo)}
        variant: NTH(item.variants[*
          FILTER CURRENT.slug == @value0
          LIMIT 1 RETURN CURRENT], 0)
      }
    `.query

describe('VideoService', () => {
  let service: VideoService
  let db: DeepMockProxy<Database>

  beforeEach(async () => {
    db = mockDeep<Database>()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoService,
        {
          provide: 'DATABASE',
          useFactory: () => db
        }
      ]
    }).compile()

    service = module.get<VideoService>(VideoService)
    service.collection = mockDeep<DocumentCollection>()
  })

  describe('videoFilter', () => {
    it('should filter with title', async () => {
      const filter = {
        title: 'abc'
      }
      const response = await service.videoFilter(filter)
      expect(response.query).toEqual(
        'SEARCH ANALYZER(TOKENS(@value0, "text_en") ALL == item.title.value, "text_en")'
      )
      expect(response.bindVars).toEqual({ value0: filter.title })
    })

    it('should filter with title and availableVariantLanguageIds', async () => {
      const filter = {
        title: 'abc',
        availableVariantLanguageIds: ['en']
      }
      const response = await service.videoFilter(filter)
      expect(response.query).toEqual(
        'SEARCH ANALYZER(TOKENS(@value0, "text_en") ALL == item.title.value, "text_en") AND item.variants.languageId IN @value1'
      )
      expect(response.bindVars).toEqual({
        value0: filter.title,
        value1: filter.availableVariantLanguageIds
      })
    })

    it('should filter with title, availableVariantLanguageIds, and subtitleLanguageIds', async () => {
      const filter = {
        title: 'abc',
        availableVariantLanguageIds: ['en'],
        subtitleLanguageIds: ['529']
      }
      const response = await service.videoFilter(filter)
      expect(response.query).toEqual(
        'SEARCH ANALYZER(TOKENS(@value0, "text_en") ALL == item.title.value, "text_en") AND item.variants.languageId IN @value1 AND item.variants.subtitle.languageId IN @value2'
      )
      expect(response.bindVars).toEqual({
        value0: filter.title,
        value1: filter.availableVariantLanguageIds,
        value2: filter.subtitleLanguageIds
      })
    })

    it('should filter with availableVariantLanguageIds', async () => {
      const filter = {
        availableVariantLanguageIds: ['en']
      }
      const response = await service.videoFilter(filter)
      expect(response.query).toEqual(
        'SEARCH item.variants.languageId IN @value0'
      )
      expect(response.bindVars).toEqual({
        value0: filter.availableVariantLanguageIds
      })
    })
  })

  it('should filter with availableVariantLanguageIds and subtitleLanguageIds', async () => {
    const filter = {
      availableVariantLanguageIds: ['en'],
      subtitleLanguageIds: ['529']
    }
    const response = await service.videoFilter(filter)
    expect(response.query).toEqual(
      'SEARCH item.variants.languageId IN @value0 AND item.variants.subtitle.languageId IN @value1'
    )
    expect(response.bindVars).toEqual({
      value0: filter.availableVariantLanguageIds,
      value1: filter.subtitleLanguageIds
    })
  })

  it('should filter with subtitleLanguageIds', async () => {
    const filter = {
      subtitleLanguageIds: ['529']
    }
    const response = await service.videoFilter(filter)
    expect(response.query).toEqual(
      'SEARCH item.variants.subtitle.languageId IN @value0'
    )
    expect(response.bindVars).toEqual({
      value0: filter.subtitleLanguageIds
    })
  })

  describe('filterAll', () => {
    it('should query', async () => {
      db.query.mockImplementationOnce(async (q) => {
        const { query, bindVars } = q as unknown as AqlQuery
        expect(query).toEqual(DEFAULT_QUERY)
        expect(bindVars).toEqual({ value0: 0, value1: 100, value2: null })
        return { all: () => [] } as unknown as ArrayCursor
      })
      expect(await service.filterAll()).toEqual([])
    })

    it('should query with offset', async () => {
      db.query.mockImplementationOnce(async (q) => {
        const { query, bindVars } = q as unknown as AqlQuery
        expect(query).toEqual(DEFAULT_QUERY)
        expect(bindVars).toEqual({ value0: 200, value1: 100, value2: null })
        return { all: () => [] } as unknown as ArrayCursor
      })
      expect(await service.filterAll({ offset: 200 })).toEqual([])
    })

    it('should query with limit', async () => {
      db.query.mockImplementationOnce(async (q) => {
        const { query, bindVars } = q as unknown as AqlQuery
        expect(query).toEqual(DEFAULT_QUERY)
        expect(bindVars).toEqual({ value0: 0, value1: 200, value2: null })
        return { all: () => [] } as unknown as ArrayCursor
      })
      expect(await service.filterAll({ limit: 200 })).toEqual([])
    })

    it('should query with variantLanguageId', async () => {
      db.query.mockImplementationOnce(async (q) => {
        const { query, bindVars } = q as unknown as AqlQuery
        expect(query).toEqual(DEFAULT_QUERY)
        expect(bindVars).toEqual({
          value0: 0,
          value1: 100,
          value2: 'en'
        })
        return { all: () => [] } as unknown as ArrayCursor
      })
      expect(await service.filterAll({ variantLanguageId: 'en' })).toEqual([])
    })
  })

  describe('getVideo', () => {
    const video = {
      id: '20615',
      bcp47: 'zh',
      name: [
        {
          value: '普通話',
          primary: true,
          videoId: '20615'
        },
        {
          value: 'Chinese, Mandarin',
          primary: false,
          videoId: '529'
        }
      ]
    }

    beforeEach(() => {
      db.query.mockReturnValue(mockDbQueryResult(service.db, [video]))
    })

    it('should return a video', async () => {
      expect(await service.getVideo('20615', '529')).toEqual(video)
    })

    it('should return a video even without a langaugeId', async () => {
      expect(await service.getVideo('20615')).toEqual(video)
    })
  })

  describe('getVideoBySlug', () => {
    it('should query the video by slug', async () => {
      db.query.mockImplementationOnce(async (q) => {
        const { query, bindVars } = q as unknown as AqlQuery
        expect(query).toEqual(GET_VIDEO_BY_SLUG_QUERY)
        expect(bindVars).toEqual({
          value0: 'jesus/english'
        })
        return { next: () => [] } as unknown as ArrayCursor
      })

      expect(await service.getVideoBySlug('jesus/english')).toEqual([])
    })
  })

  describe('children', () => {
    it('should query', async () => {
      db.query.mockImplementationOnce(async (q) => {
        const { query, bindVars } = q as unknown as AqlQuery
        expect(query).toEqual(VIDEO_CHILDREN_QUERY)
        expect(bindVars).toEqual({ value0: ['20615', '20616'], value1: null })
        return { all: () => [] } as unknown as ArrayCursor
      })
      expect(await service.getVideosByIds(['20615', '20616'])).toEqual([])
    })
  })
})
