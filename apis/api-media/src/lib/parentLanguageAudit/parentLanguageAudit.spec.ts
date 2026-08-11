import { prismaMock } from '../../../test/prismaMock'
import { updateVideoInAlgolia } from '../algolia/algoliaVideoUpdate'
import { updateVideoVariantInAlgolia } from '../algolia/algoliaVideoVariantUpdate'

import {
  auditAndRepairParent,
  findParentLanguageFindings
} from './parentLanguageAudit'

vi.mock('../algolia/algoliaVideoUpdate', () => ({
  updateVideoInAlgolia: vi.fn()
}))
vi.mock('../algolia/algoliaVideoVariantUpdate', () => ({
  updateVideoVariantInAlgolia: vi.fn()
}))

const mockedUpdateVideoInAlgolia = vi.mocked(updateVideoInAlgolia)
const mockedUpdateVideoVariantInAlgolia = vi.mocked(updateVideoVariantInAlgolia)

const emptyPlaceholder = {
  id: 'en_parent',
  languageId: '529',
  hls: '',
  dash: '',
  muxVideoId: null,
  duration: 0,
  published: true,
  downloadable: false,
  downloads: []
}

const unknownDiagnostics = {
  childVariantValidity: 'unknown',
  muxReadiness: 'unknown',
  downloadsStatus: 'unknown',
  algoliaStatus: 'unknown'
}

describe('parentLanguageAudit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUpdateVideoInAlgolia.mockResolvedValue()
    mockedUpdateVideoVariantInAlgolia.mockResolvedValue(true)
  })

  describe('findParentLanguageFindings', () => {
    it('reports a missing language as a create action', async () => {
      prismaMock.video.findUnique.mockResolvedValue({
        id: 'parent',
        availableLanguages: []
      } as never)
      prismaMock.videoVariant.findMany
        .mockResolvedValueOnce([
          { languageId: '529', videoId: 'direct-child' }
        ] as never)
        .mockResolvedValueOnce([] as never)

      const findings = await findParentLanguageFindings('parent')

      expect(findings).toEqual([
        {
          parentId: 'parent',
          childVideoId: 'direct-child',
          languageId: '529',
          existingVariantId: null,
          action: 'create',
          diagnostics: unknownDiagnostics
        }
      ])
    })

    it('is satisfied by a single qualifying child even when others lack the language', async () => {
      prismaMock.video.findUnique.mockResolvedValue({
        id: 'parent',
        availableLanguages: []
      } as never)
      prismaMock.videoVariant.findMany
        .mockResolvedValueOnce([
          { languageId: '529', videoId: 'child-a' },
          { languageId: '529', videoId: 'child-b' }
        ] as never)
        .mockResolvedValueOnce([] as never)

      const findings = await findParentLanguageFindings('parent')

      expect(findings).toHaveLength(1)
      expect(findings[0].childVideoId).toBe('child-a')
    })

    it('only queries direct published children of published videos', async () => {
      prismaMock.video.findUnique.mockResolvedValue({
        id: 'parent',
        availableLanguages: []
      } as never)
      prismaMock.videoVariant.findMany
        .mockResolvedValueOnce([] as never)
        .mockResolvedValueOnce([] as never)

      await findParentLanguageFindings('parent')

      expect(prismaMock.videoVariant.findMany).toHaveBeenNthCalledWith(1, {
        where: {
          published: true,
          video: { published: true, parents: { some: { id: 'parent' } } }
        },
        select: {
          languageId: true,
          videoId: true,
          hls: true,
          dash: true,
          muxVideoId: true,
          duration: true
        }
      })
    })

    it('reports no finding when an empty placeholder variant is already normalized', async () => {
      prismaMock.video.findUnique.mockResolvedValue({
        id: 'parent',
        availableLanguages: ['529']
      } as never)
      prismaMock.videoVariant.findMany
        .mockResolvedValueOnce([
          { languageId: '529', videoId: 'direct-child' }
        ] as never)
        .mockResolvedValueOnce([emptyPlaceholder] as never)

      const findings = await findParentLanguageFindings('parent')

      expect(findings).toEqual([])
    })

    it.each([
      ['unpublished placeholder', { published: false }],
      ['downloadable placeholder', { downloadable: true }],
      ['language missing from availableLanguages', {}]
    ])(
      'reports a normalize action for a %s generated variant',
      async (_label, overrides) => {
        const availableLanguages =
          Object.keys(overrides).length === 0 ? [] : ['529']
        prismaMock.video.findUnique.mockResolvedValue({
          id: 'parent',
          availableLanguages
        } as never)
        prismaMock.videoVariant.findMany
          .mockResolvedValueOnce([
            { languageId: '529', videoId: 'direct-child' }
          ] as never)
          .mockResolvedValueOnce([
            { ...emptyPlaceholder, ...overrides }
          ] as never)

        const findings = await findParentLanguageFindings('parent')

        expect(findings).toEqual([
          {
            parentId: 'parent',
            childVideoId: 'direct-child',
            languageId: '529',
            existingVariantId: 'en_parent',
            action: 'normalize',
            diagnostics: unknownDiagnostics
          }
        ])
      }
    )

    it.each([
      ['a Mux association', { muxVideoId: 'mux-1' }],
      ['an hls stream URL', { hls: 'https://stream.example/video.m3u8' }],
      ['a dash stream URL', { dash: 'https://stream.example/video.mpd' }],
      ['a positive duration', { duration: 120 }],
      ['a Download', { downloads: [{ id: 'download-1' }] }]
    ])(
      'reports an ambiguous action without mutating when the existing variant has %s',
      async (_label, overrides) => {
        prismaMock.video.findUnique.mockResolvedValue({
          id: 'parent',
          availableLanguages: []
        } as never)
        prismaMock.videoVariant.findMany
          .mockResolvedValueOnce([
            { languageId: '529', videoId: 'direct-child' }
          ] as never)
          .mockResolvedValueOnce([
            { ...emptyPlaceholder, published: false, ...overrides }
          ] as never)

        const findings = await findParentLanguageFindings('parent')

        expect(findings).toEqual([
          {
            parentId: 'parent',
            childVideoId: 'direct-child',
            languageId: '529',
            existingVariantId: 'en_parent',
            action: 'ambiguous',
            diagnostics: unknownDiagnostics
          }
        ])
      }
    )
  })

  describe('auditAndRepairParent', () => {
    it('does not write anything in dry-run mode', async () => {
      prismaMock.video.findUnique.mockResolvedValue({
        id: 'parent',
        availableLanguages: []
      } as never)
      prismaMock.videoVariant.findMany
        .mockResolvedValueOnce([
          { languageId: '529', videoId: 'direct-child' }
        ] as never)
        .mockResolvedValueOnce([] as never)

      const entries = await auditAndRepairParent('parent', { apply: false })

      expect(entries).toEqual([
        {
          parentId: 'parent',
          childVideoId: 'direct-child',
          languageId: '529',
          existingVariantId: null,
          action: 'create',
          diagnostics: unknownDiagnostics,
          variantId: null,
          result: 'proposed',
          indexResult: 'skipped'
        }
      ])
      expect(prismaMock.videoVariant.create).not.toHaveBeenCalled()
      expect(mockedUpdateVideoInAlgolia).not.toHaveBeenCalled()
    })

    it('creates the missing variant and indexes it in apply mode', async () => {
      prismaMock.video.findUnique
        .mockResolvedValueOnce({
          id: 'parent',
          availableLanguages: []
        } as never)
        // createEmptyParentVariant's own slug/availableLanguages lookup
        .mockResolvedValueOnce({
          slug: 'parent-slug',
          availableLanguages: []
        } as never)
      prismaMock.videoVariant.findMany
        .mockResolvedValueOnce([
          { languageId: '529', videoId: 'direct-child' }
        ] as never)
        .mockResolvedValueOnce([] as never)
      prismaMock.videoVariant.findFirst
        .mockResolvedValueOnce(null as never) // createEmptyParentVariant existing check
        .mockResolvedValueOnce({ slug: 'parent-slug/english' } as never) // language slug lookup
      prismaMock.$transaction.mockImplementation(async (callback: any) =>
        callback(prismaMock)
      )
      prismaMock.videoVariant.create.mockResolvedValue({
        id: '529_parent'
      } as never)

      const entries = await auditAndRepairParent('parent', { apply: true })

      expect(entries).toEqual([
        expect.objectContaining({
          languageId: '529',
          action: 'create',
          variantId: '529_parent',
          result: 'applied',
          indexResult: 'indexed'
        })
      ])
      expect(mockedUpdateVideoInAlgolia).toHaveBeenCalledWith('parent')
      expect(mockedUpdateVideoVariantInAlgolia).toHaveBeenCalledWith(
        '529_parent'
      )
    })

    it('keeps the database change and reports indexFailed when Algolia indexing throws', async () => {
      prismaMock.video.findUnique
        .mockResolvedValueOnce({
          id: 'parent',
          availableLanguages: []
        } as never)
        .mockResolvedValueOnce({
          slug: 'parent-slug',
          availableLanguages: []
        } as never)
      prismaMock.videoVariant.findMany
        .mockResolvedValueOnce([
          { languageId: '529', videoId: 'direct-child' }
        ] as never)
        .mockResolvedValueOnce([] as never)
      prismaMock.videoVariant.findFirst
        .mockResolvedValueOnce(null as never)
        .mockResolvedValueOnce({ slug: 'parent-slug/english' } as never)
      prismaMock.$transaction.mockImplementation(async (callback: any) =>
        callback(prismaMock)
      )
      prismaMock.videoVariant.create.mockResolvedValue({
        id: '529_parent'
      } as never)
      mockedUpdateVideoInAlgolia.mockRejectedValue(new Error('algolia down'))

      const entries = await auditAndRepairParent('parent', { apply: true })

      expect(entries).toEqual([
        expect.objectContaining({
          result: 'applied',
          indexResult: 'indexFailed'
        })
      ])
    })

    it('never mutates or indexes an ambiguous finding', async () => {
      prismaMock.video.findUnique.mockResolvedValue({
        id: 'parent',
        availableLanguages: []
      } as never)
      prismaMock.videoVariant.findMany
        .mockResolvedValueOnce([
          { languageId: '529', videoId: 'direct-child' }
        ] as never)
        .mockResolvedValueOnce([
          { ...emptyPlaceholder, muxVideoId: 'mux-1' }
        ] as never)

      const entries = await auditAndRepairParent('parent', { apply: true })

      expect(entries).toEqual([
        expect.objectContaining({ action: 'ambiguous', result: 'reported' })
      ])
      expect(prismaMock.videoVariant.update).not.toHaveBeenCalled()
      expect(mockedUpdateVideoInAlgolia).not.toHaveBeenCalled()
    })

    it('is idempotent: a second apply performs no further writes once normalized', async () => {
      prismaMock.video.findUnique.mockResolvedValue({
        id: 'parent',
        availableLanguages: ['529']
      } as never)
      prismaMock.videoVariant.findMany
        .mockResolvedValueOnce([
          { languageId: '529', videoId: 'direct-child' }
        ] as never)
        .mockResolvedValueOnce([emptyPlaceholder] as never)

      const entries = await auditAndRepairParent('parent', { apply: true })

      expect(entries).toEqual([])
      expect(prismaMock.videoVariant.create).not.toHaveBeenCalled()
      expect(prismaMock.videoVariant.update).not.toHaveBeenCalled()
    })
  })
})
