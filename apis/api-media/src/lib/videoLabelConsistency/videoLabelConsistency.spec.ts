import fetch from 'node-fetch'
import { type MockedFunction, vi } from 'vitest'

import { prismaMock } from '../../../test/prismaMock'
import { logger } from '../../logger'

import {
  findVideoLabelInconsistencies,
  sendVideoLabelConsistencyAlert
} from './videoLabelConsistency'

vi.mock('node-fetch')

describe('videoLabelConsistency', () => {
  const mockFetch = fetch as MockedFunction<typeof fetch>
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = {
      ...originalEnv,
      SLACK_VIDEO_ADMIN_BOT_TOKEN: 'test-token',
      SLACK_DATA_LANGS_CHANNEL_ID: 'test-channel'
    }
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ ok: true, ts: '1111.1111' })
    } as any)
    prismaMock.video.findMany.mockResolvedValue([])
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('findVideoLabelInconsistencies', () => {
    it('finds series and collection videos that have no children', async () => {
      prismaMock.video.findMany.mockResolvedValueOnce([
        { id: '13_0-RPGospel0401', slug: 'gospel-part-1', label: 'series' }
      ] as any)
      prismaMock.video.findMany.mockResolvedValueOnce([])

      const result = await findVideoLabelInconsistencies()

      expect(prismaMock.video.findMany).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          where: {
            label: { in: ['series', 'collection'] },
            childIds: { isEmpty: true },
            children: { none: {} }
          }
        })
      )
      expect(result.emptyContainers).toEqual([
        { id: '13_0-RPGospel0401', slug: 'gospel-part-1', label: 'series' }
      ])
      expect(result.seriesWithoutCollectionParent).toEqual([])
    })

    it('finds series whose parent is not a collection', async () => {
      prismaMock.video.findMany.mockResolvedValueOnce([])
      prismaMock.video.findMany.mockResolvedValueOnce([
        {
          id: 'series-1',
          slug: 'series-one',
          label: 'series',
          parents: [
            { id: 'collection-1', label: 'collection' },
            { id: 'series-0', label: 'series' }
          ]
        }
      ] as any)

      const result = await findVideoLabelInconsistencies()

      expect(prismaMock.video.findMany).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          where: {
            label: 'series',
            parents: { some: { label: { not: 'collection' } } }
          }
        })
      )
      expect(result.seriesWithoutCollectionParent).toEqual([
        {
          id: 'series-1',
          slug: 'series-one',
          label: 'series',
          parentId: 'series-0',
          parentLabel: 'series'
        }
      ])
    })

    it('only reads from the database', async () => {
      await findVideoLabelInconsistencies()

      expect(prismaMock.video.create).not.toHaveBeenCalled()
      expect(prismaMock.video.update).not.toHaveBeenCalled()
      expect(prismaMock.video.updateMany).not.toHaveBeenCalled()
      expect(prismaMock.video.delete).not.toHaveBeenCalled()
    })
  })

  describe('sendVideoLabelConsistencyAlert', () => {
    it('does not post to Slack when nothing is inconsistent', async () => {
      await sendVideoLabelConsistencyAlert(logger)

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('posts both groups of rows to the data-languages channel', async () => {
      prismaMock.video.findMany.mockResolvedValueOnce([
        { id: '13_0-RPGospel0401', slug: 'gospel-part-1', label: 'series' }
      ] as any)
      prismaMock.video.findMany.mockResolvedValueOnce([
        {
          id: 'series-1',
          slug: 'series-one',
          label: 'series',
          parents: [{ id: 'series-0', label: 'series' }]
        }
      ] as any)

      await sendVideoLabelConsistencyAlert(logger)

      expect(mockFetch).toHaveBeenCalledTimes(1)
      const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string)
      expect(body.channel).toBe('test-channel')
      expect(body.text).toContain('2 video label inconsistencies')
      const rendered = JSON.stringify(body.blocks)
      expect(rendered).toContain('13_0-RPGospel0401')
      expect(rendered).toContain('series-1')
      expect(rendered).toContain('series-0')
    })

    it('caps the rows listed and reports how many were left out', async () => {
      const many = Array.from({ length: 30 }, (_, index) => ({
        id: `video-${index}`,
        slug: `slug-${index}`,
        label: 'collection'
      }))
      prismaMock.video.findMany.mockResolvedValueOnce(many as any)
      prismaMock.video.findMany.mockResolvedValueOnce([])

      await sendVideoLabelConsistencyAlert(logger)

      const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string)
      const rendered = JSON.stringify(body.blocks)
      expect(rendered).toContain('video-14')
      expect(rendered).not.toContain('video-15')
      expect(rendered).toContain('and 15 more')
    })

    it('skips quietly when Slack is not configured', async () => {
      delete process.env.SLACK_VIDEO_ADMIN_BOT_TOKEN
      prismaMock.video.findMany.mockResolvedValueOnce([
        { id: 'a', slug: 'a', label: 'series' }
      ] as any)
      prismaMock.video.findMany.mockResolvedValueOnce([])

      await sendVideoLabelConsistencyAlert(logger)

      expect(mockFetch).not.toHaveBeenCalled()
    })
  })
})
