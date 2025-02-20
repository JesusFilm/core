import { Video } from '.prisma/api-media-client'

import { prismaMock } from '../../../../../test/prismaMock'
import { processTable } from '../../importer'

import { importMany, importOne, setVideoIds, setVideoSlugs } from './videos'

import { getVideoIds, getVideoSlugs, importVideos } from '.'

jest.mock('../../importer', () => ({
  processTable: jest.fn(),
  parse: jest.requireActual('../../importer').parse,
  parseMany: jest.requireActual('../../importer').parseMany
}))

describe('bigQuery/importers/videos', () => {
  afterEach(() => {
    setVideoIds([])
    setVideoSlugs([])
  })

  describe('importVideos', () => {
    it('should import videos', async () => {
      prismaMock.video.findMany.mockResolvedValue([
        { id: '1', slug: 'abc' } as unknown as Video,
        { id: '2', slug: null } as unknown as Video
      ])
      expect(getVideoIds()).toEqual([])
      expect(getVideoSlugs()).toEqual({})
      const cleanup = await importVideos()
      expect(getVideoIds()).toEqual(['1', '2'])
      expect(getVideoSlugs()).toEqual({ abc: '1' })
      cleanup()
      expect(getVideoIds()).toEqual([])
      expect(getVideoSlugs()).toEqual({})
      expect(processTable).toHaveBeenCalledWith(
        'jfp-data-warehouse.jfp_mmdb_prod.core_video_arclight_data',
        importOne,
        importMany,
        true,
        undefined
      )
    })
  })

  describe('importOne', () => {
    it('should import one video', async () => {
      prismaMock.video.upsert.mockResolvedValue({} as unknown as Video)
      setVideoSlugs([{ id: 'mockValue1', slug: 'some-title' }])
      await importOne({
        id: 'mockValue0',
        label: 'short',
        primaryLanguageId: 529,
        slug: 'Some Title',
        extraStuff: 'randomData',
        childIds: null,
        image: null,
        thumbnail: null,
        videoStill: null,
        mobileCinematicHigh: null,
        mobileCinematicLow: null,
        mobileCinematicVeryLow: null
      })
      expect(prismaMock.video.upsert).toHaveBeenCalledWith({
        where: { id: 'mockValue0' },
        create: {
          id: 'mockValue0',
          label: 'shortFilm',
          primaryLanguageId: '529',
          slug: 'some-title-2',
          childIds: [],
          noIndex: false
        },
        update: {
          id: 'mockValue0',
          label: 'shortFilm',
          primaryLanguageId: '529',
          slug: 'some-title-2',
          childIds: [],
          noIndex: false
        }
      })
    })
  })

  describe('importMany', () => {
    it('should import many videos', async () => {
      prismaMock.video.createMany.mockImplementation()
      await importMany([
        {
          id: 'mockValue0',
          label: 'short',
          primaryLanguageId: 529,
          slug: 'Some Title',
          extraStuff: 'randomData',
          childIds: null,
          image: null,
          thumbnail: null,
          videoStill: null,
          mobileCinematicHigh: null,
          mobileCinematicLow: null,
          mobileCinematicVeryLow: null
        },
        {
          id: 'mockValue1',
          label: 'segments',
          primaryLanguageId: 529,
          slug: 'Some Title',
          extraStuff: 'randomData',
          childIds: null
        }
      ])
      expect(prismaMock.video.createMany).toHaveBeenCalledWith({
        data: [
          {
            id: 'mockValue0',
            label: 'shortFilm',
            primaryLanguageId: '529',
            slug: 'some-title',
            childIds: [],
            noIndex: false
          },
          {
            id: 'mockValue1',
            label: 'segment',
            primaryLanguageId: '529',
            slug: 'some-title-2',
            childIds: [],
            noIndex: false
          }
        ],
        skipDuplicates: true
      })
    })

    it('should throw error if some rows do not match schema', async () => {
      await expect(
        importMany([
          {
            id: '1',
            primaryLanguageId: '529',
            slug: 'some-title',
            childIds: [],
            noIndex: false
          },
          {
            osisId: 'Eccl'
          }
        ])
      ).rejects.toThrow('some rows do not match schema: 1,unknownId')
    })
  })
})
