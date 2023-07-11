import { Test, TestingModule } from '@nestjs/testing'
import { CacheModule } from '@nestjs/common'
import { VideoLabel } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

import { VideoService } from './video.service'

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

describe('VideoService', () => {
  let service: VideoService, prismaService: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [VideoService, PrismaService]
    }).compile()

    service = module.get<VideoService>(VideoService)
    prismaService = await module.resolve(PrismaService)
  })

  describe('videoFilter', () => {
    it('should search with title', () => {
      const filter = {
        title: 'abc'
      }
      const response = service.videoFilter(filter)
      expect(response).toContain(
        'SEARCH ANALYZER(TOKENS(@value0, "text_en") ALL == item.title.value, "text_en")'
      )
      // expect(response.bindVars).toEqual({ value0: filter.title })
    })

    it('should filter with availableVariantLanguageIds', () => {
      const filter = {
        availableVariantLanguageIds: ['en']
      }
      const response = service.videoFilter(filter)
      expect(response).toContain('SEARCH item.variants.languageId IN @value0')
      // expect(response.bindVars).toEqual({
      // value0: filter.availableVariantLanguageIds
      // })
    })

    it('should filter by label', () => {
      const filter = {
        labels: [VideoLabel.collection]
      }
      const response = service.videoFilter(filter)
      expect(response).toContain('SEARCH item.label IN @value0')
      // expect(response.bindVars).toEqual({
      //   value0: filter.labels
      // })
    })

    it('should filter by id', () => {
      const filter = {
        ids: ['videoId']
      }
      const response = service.videoFilter(filter)
      expect(response).toContain('SEARCH item._key IN @value0')
      // expect(response.bindVars).toEqual({
      //   value0: filter.ids
      // })
    })

    it('should filter and search by all', () => {
      const filter = {
        title: 'abc',
        availableVariantLanguageIds: ['en'],
        labels: [VideoLabel.collection],
        ids: ['videoId']
      }
      const response = service.videoFilter(filter)
      expect(response).toContain(
        'SEARCH ANALYZER(TOKENS(@value0, "text_en") ALL == item.title.value, "text_en") AND item.variants.languageId IN @value1 AND item.label IN @value2 AND item._key IN @value3'
      )
      // expect(response.bindVars).toEqual({
      //   value0: filter.title,
      //   value1: filter.availableVariantLanguageIds,
      //   value2: filter.labels,
      //   value3: filter.ids
      // })
    })
  })

  it('should filter with subtitleLanguageIds', async () => {
    const filter = {
      subtitleLanguageIds: ['529']
    }
    const response = await service.videoFilter(filter)
    expect(response).toContain(
      'SEARCH item.variants.subtitle.languageId IN @value0'
    )
    // expect(response.bindVars).toEqual({
    //   value0: filter.subtitleLanguageIds
    // })
  })

  describe('filterAll', () => {
    it('should query', async () => {
      // db.query.mockImplementationOnce(async (q) => {
      //   const { query, bindVars } = q as unknown as AqlQuery
      //   expect(query).toEqual(DEFAULT_QUERY)
      //   expect(bindVars).toEqual({ value0: 0, value1: 100, value2: null })
      //   return { all: () => [] } as unknown as ArrayCursor
      // })
      expect(await service.filterAll()).toEqual([])
      // should cache
      expect(await service.filterAll()).toEqual([])
      // expect(db.query).toHaveBeenCalledTimes(1)
    })

    it('should query with offset', async () => {
      // db.query.mockImplementationOnce(async (q) => {
      //   const { query, bindVars } = q as unknown as AqlQuery
      //   expect(query).toEqual(DEFAULT_QUERY)
      //   expect(bindVars).toEqual({ value0: 200, value1: 100, value2: null })
      //   return { all: () => [] } as unknown as ArrayCursor
      // })
      expect(await service.filterAll({ offset: 200 })).toEqual([])
      // should cache
      expect(await service.filterAll({ offset: 200 })).toEqual([])
      // expect(db.query).toHaveBeenCalledTimes(1)
    })

    it('should query with limit', async () => {
      // db.query.mockImplementationOnce(async (q) => {
      //   const { query, bindVars } = q as unknown as AqlQuery
      //   expect(query).toEqual(DEFAULT_QUERY)
      //   expect(bindVars).toEqual({ value0: 0, value1: 200, value2: null })
      //   return { all: () => [] } as unknown as ArrayCursor
      // })
      expect(await service.filterAll({ limit: 200 })).toEqual([])
      // should cache
      expect(await service.filterAll({ limit: 200 })).toEqual([])
      // expect(db.query).toHaveBeenCalledTimes(1)
    })

    it('should query with variantLanguageId', async () => {
      // db.query.mockImplementationOnce(async (q) => {
      //   const { query, bindVars } = q as unknown as AqlQuery
      //   expect(query).toEqual(DEFAULT_QUERY)
      //   expect(bindVars).toEqual({
      //     value0: 0,
      //     value1: 100,
      //     value2: 'en'
      //   })
      //   return { all: () => [] } as unknown as ArrayCursor
      // })
      expect(await service.filterAll({ variantLanguageId: 'en' })).toEqual([])
      // should cache
      expect(await service.filterAll({ variantLanguageId: 'en' })).toEqual([])
      // expect(db.query).toHaveBeenCalledTimes(1)
    })
  })

  describe('getVideo', () => {
    // beforeEach(() => {
    //   db.query.mockReturnValue(mockDbQueryResult(service.db, [video]))
    // })

    it('should return a video', async () => {
      expect(await service.getVideo('20615', '529')).toEqual(video)
      // should cache
      expect(await service.getVideo('20615', '529')).toEqual(video)
      // expect(db.query).toHaveBeenCalledTimes(1)
    })

    it('should return a video even without a langaugeId', async () => {
      expect(await service.getVideo('20615')).toEqual(video)
      // should cache
      expect(await service.getVideo('20615')).toEqual(video)
      // expect(db.query).toHaveBeenCalledTimes(1)
    })
  })

  describe('getVideoBySlug', () => {
    it('should query the video by slug', async () => {
      // db.query.mockImplementationOnce(async (q) => {
      //   const { query, bindVars } = q as unknown as AqlQuery
      //   // expect(query).toEqual(GET_VIDEO_BY_SLUG_QUERY)
      //   expect(bindVars).toEqual({
      //     value0: 'jesus/english'
      //   })
      //   return { next: () => [] } as unknown as ArrayCursor
      // })

      expect(await service.getVideoBySlug('jesus/english')).toEqual([])
      // should cache
      expect(await service.getVideoBySlug('jesus/english')).toEqual([])
      // expect(db.query).toHaveBeenCalledTimes(1)
    })
  })

  describe('children', () => {
    // beforeEach(() => {
    //   db.query.mockReturnValueOnce(mockDbQueryResult(service.db, [video]))
    //   db.query.mockReturnValueOnce(mockDbQueryResult(service.db, [video]))
    // })
    it('should query', async () => {
      expect(await service.getVideosByIds(['20615', '20616'])).toEqual([
        video,
        video
      ])
      // expect(db.query).toHaveBeenCalledTimes(2)
      // should cache
      expect(await service.getVideosByIds(['20615', '20616'])).toEqual([
        video,
        video
      ])
      // expect(db.query).toHaveBeenCalledTimes(2)
    })
  })
})
