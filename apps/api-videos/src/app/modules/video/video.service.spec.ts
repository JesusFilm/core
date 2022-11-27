import { Test, TestingModule } from '@nestjs/testing'
import { mockDbQueryResult } from '@core/nest/database/mock'
import { Database, aql } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { DocumentCollection } from 'arangojs/collection'
import { ArrayCursor } from 'arangojs/cursor'
import { AqlQuery, GeneratedAqlQuery } from 'arangojs/aql'
import { IdType, VideoType } from '../../__generated__/graphql'
import { VideoService } from './video.service'

const baseVideo: GeneratedAqlQuery[] = [
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
        imageAlt: item.imageAlt,
        primaryLanguageId: item.primaryLanguageId,`
]

const DEFAULT_QUERY = aql`
    FOR item IN 
      
      LIMIT ${0}, ${100}
      RETURN {
        ${aql.join(baseVideo)}
        variant: NTH(item.variants[* 
          FILTER CURRENT.languageId == NOT_NULL(${null}, item.primaryLanguageId)
          LIMIT 1 RETURN CURRENT
        ], 0),
        variantLanguages: item.variants[* RETURN { id : CURRENT.languageId }]
      }
    `.query

const VIDEO_EPISODES_QUERY = aql`
    FOR item IN 
      FILTER item._key IN @value0
      RETURN {
        ${aql.join(baseVideo)}
        variant: NTH(item.variants[* 
          FILTER CURRENT.languageId == NOT_NULL(@value1, item.primaryLanguageId)
          LIMIT 1 RETURN CURRENT], 0),
        variantLanguages: item.variants[* RETURN { id : CURRENT.languageId }]
      }
    `.query

const EPISODES_QUERY = aql`
    FOR video IN 
      FILTER video._key == @value0
      LIMIT 1
      FOR item IN 
        FILTER item._key IN video.episodeIds
        
        LIMIT @value1, @value2
        RETURN {
          ${aql.join(baseVideo)}
          variant: NTH(item.variants[* 
          FILTER CURRENT.languageId == NOT_NULL(@value3, item.primaryLanguageId)
          LIMIT 1 RETURN CURRENT
        ], 0),
          variantLanguages: item.variants[* RETURN { id : CURRENT.languageId }]
        }
    `.query

const GET_VIDEO_BY_SLUG_QUERY = aql`
    FOR item IN 
      FILTER @value0 IN item.variants[*].path
      LIMIT 1
      RETURN {
        ${aql.join(baseVideo)}
        playlist: item.playlist,
        variant: NTH(item.variants[*
          FILTER CURRENT.path == @value0
          LIMIT 1 RETURN CURRENT], 0),
        variantLanguages: item.variants[* RETURN { id : CURRENT.languageId }]
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
    it('should filter with specific types', async () => {
      const filter = {
        types: [VideoType.playlist, VideoType.standalone]
      }
      const response = await service.videoFilter(filter)
      expect(response.query).toEqual('FILTER item.type IN @value0')
      expect(response.bindVars).toEqual({ value0: filter.types })
    })

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

  describe('filterEpisodes', () => {
    const filter = {
      playlistId: 'playlistId',
      idType: IdType.databaseId
    }
    it('should query', async () => {
      db.query.mockImplementationOnce(async (q) => {
        const { query, bindVars } = q as unknown as AqlQuery
        expect(query).toEqual(EPISODES_QUERY)
        expect(bindVars).toEqual({
          value0: filter.playlistId,
          value1: 0,
          value2: 100,
          value3: null
        })
        return { all: () => [] } as unknown as ArrayCursor
      })
      expect(await service.filterEpisodes(filter)).toEqual([])
    })

    it('should query with offset', async () => {
      db.query.mockImplementationOnce(async (q) => {
        const { query, bindVars } = q as unknown as AqlQuery
        expect(query).toEqual(EPISODES_QUERY)
        expect(bindVars).toEqual({
          value0: filter.playlistId,
          value1: 200,
          value2: 100,
          value3: null
        })
        return { all: () => [] } as unknown as ArrayCursor
      })
      expect(await service.filterEpisodes({ ...filter, offset: 200 })).toEqual(
        []
      )
    })

    it('should query with limit', async () => {
      db.query.mockImplementationOnce(async (q) => {
        const { query, bindVars } = q as unknown as AqlQuery
        expect(query).toEqual(EPISODES_QUERY)
        expect(bindVars).toEqual({
          value0: filter.playlistId,
          value1: 0,
          value2: 200,
          value3: null
        })
        return { all: () => [] } as unknown as ArrayCursor
      })
      expect(await service.filterEpisodes({ ...filter, limit: 200 })).toEqual(
        []
      )
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
          value0: 'jesus.html/english.html'
        })
        return { next: () => [] } as unknown as ArrayCursor
      })

      expect(await service.getVideoBySlug('jesus.html/english.html')).toEqual(
        []
      )
    })
  })

  describe('episodes', () => {
    it('should query', async () => {
      db.query.mockImplementationOnce(async (q) => {
        const { query, bindVars } = q as unknown as AqlQuery
        expect(query).toEqual(VIDEO_EPISODES_QUERY)
        expect(bindVars).toEqual({ value0: ['20615', '20616'], value1: null })
        return { all: () => [] } as unknown as ArrayCursor
      })
      expect(await service.getVideosByIds(['20615', '20616'])).toEqual([])
    })
  })
})
