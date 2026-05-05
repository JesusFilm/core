import { prismaMock } from '../../../test/prismaMock'

import {
  computeAvailableLanguagesIssues,
  computeUploadStateIssues
} from './videoIssueChecks'

describe('videoIssueChecks', () => {
  describe('computeAvailableLanguagesIssues', () => {
    it('returns empty when every video matches its expected set', async () => {
      prismaMock.video.findMany.mockResolvedValue([
        {
          id: 'v1',
          availableLanguages: ['529', '496'],
          title: [{ value: 'Jesus' }],
          variants: [{ languageId: '529' }, { languageId: '496' }],
          children: []
        }
      ] as never)

      const issues = await computeAvailableLanguagesIssues()
      expect(issues).toEqual([])
    })

    it('flags missing languages from variants', async () => {
      prismaMock.video.findMany.mockResolvedValue([
        {
          id: 'v1',
          availableLanguages: ['529'],
          title: [{ value: 'Jesus' }],
          variants: [{ languageId: '529' }, { languageId: '496' }],
          children: []
        }
      ] as never)

      const issues = await computeAvailableLanguagesIssues()
      expect(issues).toEqual([
        {
          videoId: 'v1',
          videoTitle: 'Jesus',
          expected: ['496', '529'],
          actual: ['529'],
          missing: ['496'],
          extra: []
        }
      ])
    })

    it('flags extra languages not backed by a variant or child', async () => {
      prismaMock.video.findMany.mockResolvedValue([
        {
          id: 'v1',
          availableLanguages: ['529', '999'],
          title: [{ value: 'Magdalena' }],
          variants: [{ languageId: '529' }],
          children: []
        }
      ] as never)

      const issues = await computeAvailableLanguagesIssues()
      expect(issues).toEqual([
        {
          videoId: 'v1',
          videoTitle: 'Magdalena',
          expected: ['529'],
          actual: ['529', '999'],
          missing: [],
          extra: ['999']
        }
      ])
    })

    it('unions child availableLanguages into expected', async () => {
      prismaMock.video.findMany.mockResolvedValue([
        {
          id: 'series1',
          availableLanguages: ['529'],
          title: [{ value: 'A series' }],
          variants: [],
          children: [
            { availableLanguages: ['529', '496'] },
            { availableLanguages: ['496', '7083'] }
          ]
        }
      ] as never)

      const issues = await computeAvailableLanguagesIssues()
      expect(issues[0]?.expected).toEqual(['496', '529', '7083'])
      expect(issues[0]?.missing).toEqual(['496', '7083'])
    })
  })

  describe('computeUploadStateIssues', () => {
    function makeR2(overrides: Record<string, unknown> = {}): unknown {
      return {
        id: 'r2-1',
        fileName: 'video.mp4',
        videoId: 'v1',
        createdAt: new Date('2026-04-01T00:00:00Z'),
        videoVariant: null,
        ...overrides
      }
    }

    it('flags an asset with no linked variant as no_variant', async () => {
      prismaMock.cloudflareR2.findMany.mockResolvedValue([makeR2()] as never)

      const issues = await computeUploadStateIssues()
      expect(issues).toEqual([
        {
          r2AssetId: 'r2-1',
          fileName: 'video.mp4',
          videoId: 'v1',
          stage: 'no_variant',
          r2CreatedAt: new Date('2026-04-01T00:00:00Z'),
          muxVideoId: null,
          muxReadyToStream: null
        }
      ])
    })

    it('flags an asset with a variant but no MuxVideo as no_mux', async () => {
      prismaMock.cloudflareR2.findMany.mockResolvedValue([
        makeR2({ videoVariant: { muxVideo: null } })
      ] as never)

      const issues = await computeUploadStateIssues()
      expect(issues[0]?.stage).toBe('no_mux')
      expect(issues[0]?.muxVideoId).toBeNull()
    })

    it('flags a MuxVideo that has not finished processing as mux_not_ready', async () => {
      prismaMock.cloudflareR2.findMany.mockResolvedValue([
        makeR2({
          videoVariant: {
            muxVideo: { id: 'mux-1', readyToStream: false }
          }
        })
      ] as never)

      const issues = await computeUploadStateIssues()
      expect(issues[0]?.stage).toBe('mux_not_ready')
      expect(issues[0]?.muxVideoId).toBe('mux-1')
      expect(issues[0]?.muxReadyToStream).toBe(false)
    })

    it('returns nothing for a healthy ready-to-stream variant', async () => {
      prismaMock.cloudflareR2.findMany.mockResolvedValue([
        makeR2({
          videoVariant: {
            muxVideo: { id: 'mux-1', readyToStream: true }
          }
        })
      ] as never)

      const issues = await computeUploadStateIssues()
      expect(issues).toEqual([])
    })
  })
})
