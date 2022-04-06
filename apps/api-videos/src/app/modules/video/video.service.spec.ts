import { Test, TestingModule } from '@nestjs/testing'
import { mockDbQueryResult } from '@core/nest/database'
import { Database, aql } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { DocumentCollection } from 'arangojs/collection'
import { ArrayCursor } from 'arangojs/cursor'
import { AqlQuery } from 'arangojs/aql'
import { VideoService } from './video.service'

const DEFAULT_QUERY = aql`
    FOR item IN 
      
      FILTER item.episodeIds == null
      LIMIT ${0}, ${100}
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
          FILTER CURRENT.languageId == NOT_NULL(${null}, item.primaryLanguageId)
          LIMIT 1 RETURN CURRENT
        ], 0),
        variantLanguages: item.variants[* RETURN { id : CURRENT.languageId }],
        episodeIds: item.episodeIds
      }
    `.query

const QUERY_WITH_TITLE = aql`
    FOR item IN 
      SEARCH ANALYZER(TOKENS(${'abc'}, "text_en") ALL == item.title.value, "text_en")
      FILTER item.episodeIds == null
      LIMIT ${0}, ${100}
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
          FILTER CURRENT.languageId == NOT_NULL(${null}, item.primaryLanguageId)
          LIMIT 1 RETURN CURRENT
        ], 0),
        variantLanguages: item.variants[* RETURN { id : CURRENT.languageId }],
        episodeIds: item.episodeIds
      }
    `.query

const QUERY_WITH_AVAILABLE_VARIANT_LANGUAGE_IDS = aql`
    FOR item IN 
      SEARCH item.variants.languageId IN ${['en']}
      FILTER item.episodeIds == null
      LIMIT ${0}, ${100}
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
          FILTER CURRENT.languageId == NOT_NULL(${null}, item.primaryLanguageId)
          LIMIT 1 RETURN CURRENT
        ], 0),
        variantLanguages: item.variants[* RETURN { id : CURRENT.languageId }],
        episodeIds: item.episodeIds
      }
    `.query

const QUERY_WITH_TITLE_AND_AVAILABLE_VARIANT_LANGUAGE_IDS = aql`
    FOR item IN 
      SEARCH ANALYZER(TOKENS(${'abc'}, "text_en") ALL == item.title.value, "text_en") AND item.variants.languageId IN ${[
  'en'
]}
      FILTER item.episodeIds == null
      LIMIT ${0}, ${100}
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
          FILTER CURRENT.languageId == NOT_NULL(${null}, item.primaryLanguageId)
          LIMIT 1 RETURN CURRENT
        ], 0),
        variantLanguages: item.variants[* RETURN { id : CURRENT.languageId }],
        episodeIds: item.episodeIds
      }
    `.query

const QUERY_WITH_ONLY_PLAYLISTS = aql`
    FOR item IN 
      
      FILTER item.episodeIds != null
      LIMIT ${0}, ${100}
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
          FILTER CURRENT.languageId == NOT_NULL(${null}, item.primaryLanguageId)
          LIMIT 1 RETURN CURRENT
        ], 0),
        variantLanguages: item.variants[* RETURN { id : CURRENT.languageId }],
        episodeIds: item.episodeIds
      }
    `.query

const QUERY_WITH_PLAYLISTS = aql`
    FOR item IN 
      
      
      LIMIT ${0}, ${100}
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
          FILTER CURRENT.languageId == NOT_NULL(${null}, item.primaryLanguageId)
          LIMIT 1 RETURN CURRENT
        ], 0),
        variantLanguages: item.variants[* RETURN { id : CURRENT.languageId }],
        episodeIds: item.episodeIds
      }
    `.query

const QUERY_WITHOUT_PLAYLIST_VIDEOS = aql`
    FOR item IN 
      
      FILTER item.episodeIds == null FILTER item.isInnerSeries != true
      LIMIT @value0, @value1
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
          FILTER CURRENT.languageId == NOT_NULL(@value2, item.primaryLanguageId)
          LIMIT 1 RETURN CURRENT
        ], 0),
        variantLanguages: item.variants[* RETURN { id : CURRENT.languageId }],
        episodeIds: item.episodeIds
      }
    `.query

const EPISODES_QUERY = aql`
    FOR item IN 
      FILTER item._key IN @value0
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
          FILTER CURRENT.languageId == NOT_NULL(@value1, item.primaryLanguageId)
          LIMIT 1 RETURN CURRENT], 0),
        variantLanguages: item.variants[* RETURN { id : CURRENT.languageId }],
        episodeIds: item.episodeIds
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

    it('should query with title', async () => {
      db.query.mockImplementationOnce(async (q) => {
        const { query, bindVars } = q as unknown as AqlQuery
        expect(query).toEqual(QUERY_WITH_TITLE)
        expect(bindVars).toEqual({
          value0: 'abc',
          value1: 0,
          value2: 100,
          value3: null
        })
        return { all: () => [] } as unknown as ArrayCursor
      })
      expect(await service.filterAll({ title: 'abc' })).toEqual([])
    })

    it('should query with availableVariantLanguageIds', async () => {
      db.query.mockImplementationOnce(async (q) => {
        const { query, bindVars } = q as unknown as AqlQuery
        expect(query).toEqual(QUERY_WITH_AVAILABLE_VARIANT_LANGUAGE_IDS)
        expect(bindVars).toEqual({
          value0: ['en'],
          value1: 0,
          value2: 100,
          value3: null
        })
        return { all: () => [] } as unknown as ArrayCursor
      })
      expect(
        await service.filterAll({ availableVariantLanguageIds: ['en'] })
      ).toEqual([])
    })

    it('should query with title and availableVariantLanguageIds', async () => {
      db.query.mockImplementationOnce(async (q) => {
        const { query, bindVars } = q as unknown as AqlQuery
        expect(query).toEqual(
          QUERY_WITH_TITLE_AND_AVAILABLE_VARIANT_LANGUAGE_IDS
        )
        expect(bindVars).toEqual({
          value0: 'abc',
          value1: ['en'],
          value2: 0,
          value3: 100,
          value4: null
        })
        return { all: () => [] } as unknown as ArrayCursor
      })
      expect(
        await service.filterAll({
          title: 'abc',
          availableVariantLanguageIds: ['en']
        })
      ).toEqual([])
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

    it('should query only playlists', async () => {
      db.query.mockImplementationOnce(async (q) => {
        const { query, bindVars } = q as unknown as AqlQuery
        expect(query).toEqual(QUERY_WITH_ONLY_PLAYLISTS)
        expect(bindVars).toEqual({
          value0: 0,
          value1: 100,
          value2: null
        })
        return { all: () => [] } as unknown as ArrayCursor
      })
      expect(await service.filterAll({ onlyPlaylists: true })).toEqual([])
    })

    it('should include playlists', async () => {
      db.query.mockImplementationOnce(async (q) => {
        const { query, bindVars } = q as unknown as AqlQuery
        expect(query).toEqual(QUERY_WITH_PLAYLISTS)
        expect(bindVars).toEqual({
          value0: 0,
          value1: 100,
          value2: null
        })
        return { all: () => [] } as unknown as ArrayCursor
      })
      expect(await service.filterAll({ includePlaylists: true })).toEqual([])
    })

    it('should exlude inner playlist videos', async () => {
      db.query.mockImplementationOnce(async (q) => {
        const { query, bindVars } = q as unknown as AqlQuery
        expect(query).toEqual(QUERY_WITHOUT_PLAYLIST_VIDEOS)
        expect(bindVars).toEqual({
          value0: 0,
          value1: 100,
          value2: null
        })
        return { all: () => [] } as unknown as ArrayCursor
      })
      expect(await service.filterAll({ includePlaylistVideos: false })).toEqual(
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

  describe('episodes', () => {
    it('should query', async () => {
      db.query.mockImplementationOnce(async (q) => {
        const { query, bindVars } = q as unknown as AqlQuery
        expect(query).toEqual(EPISODES_QUERY)
        expect(bindVars).toEqual({ value0: ['20615', '20616'], value1: null })
        return { all: () => [] } as unknown as ArrayCursor
      })
      expect(await service.getVideosByIds(['20615', '20616'])).toEqual([])
    })
  })
})
