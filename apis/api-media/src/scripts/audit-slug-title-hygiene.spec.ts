import { describe, expect, it } from 'vitest'

import { prismaMock } from '../../test/prismaMock'

import { auditSlugTitleHygiene } from './audit-slug-title-hygiene'

describe('auditSlugTitleHygiene', () => {
  it('flags a raw production filename as a high-confidence, auto-fixable title', async () => {
    prismaMock.video.findMany.mockResolvedValue([
      {
        id: 'video-1',
        slug: 'brand-video',
        published: true,
        title: [{ value: 'Brand_Video', languageId: '529' }],
        variants: []
      }
    ] as never)

    const findings = await auditSlugTitleHygiene()

    expect(findings).toEqual([
      {
        videoId: 'video-1',
        videoSlug: 'brand-video',
        published: true,
        field: 'VideoTitle.value',
        languageId: '529',
        variantSlug: null,
        currentValue: 'Brand_Video',
        reasons: ['underscore'],
        proposedValue: 'Brand Video',
        needsContentReview: false
      }
    ])
  })

  it('flags a dash-separated bilingual title for review without proposing a fix', async () => {
    prismaMock.video.findMany.mockResolvedValue([
      {
        id: 'video-2',
        slug: 'la-busqueda-the-search',
        published: true,
        title: [{ value: 'La Búsqueda - The Search', languageId: '529' }],
        variants: []
      }
    ] as never)

    const findings = await auditSlugTitleHygiene()

    expect(findings).toHaveLength(1)
    expect(findings[0]).toMatchObject({
      field: 'VideoTitle.value',
      reasons: ['possible-multilingual-concatenation'],
      proposedValue: null,
      needsContentReview: true
    })
  })

  it('does not flag a concatenated two-word title with no separator', async () => {
    prismaMock.video.findMany.mockResolvedValue([
      {
        id: 'video-3',
        slug: 'tumlukden-nura',
        published: true,
        title: [{ value: 'Tümlükden Nura', languageId: '4797' }],
        variants: []
      }
    ] as never)

    const findings = await auditSlugTitleHygiene()

    // Documented limitation: an unseparated multilingual concatenation is
    // indistinguishable from an ordinary two-word title by pattern-matching
    // alone. Confirming this case requires a human or a per-language
    // reference-title comparison, not a mechanical rule.
    expect(findings).toEqual([])
  })

  it('flags leading/trailing whitespace on a slug and proposes a trimmed value', async () => {
    prismaMock.video.findMany.mockResolvedValue([
      {
        id: 'video-4',
        slug: ' stray-space-slug ',
        published: false,
        title: [],
        variants: []
      }
    ] as never)

    const findings = await auditSlugTitleHygiene()

    expect(findings).toEqual([
      {
        videoId: 'video-4',
        videoSlug: ' stray-space-slug ',
        published: false,
        field: 'Video.slug',
        languageId: null,
        variantSlug: null,
        currentValue: ' stray-space-slug ',
        reasons: ['leading-or-trailing-whitespace'],
        proposedValue: 'stray-space-slug',
        needsContentReview: false
      }
    ])
  })

  it('flags a legitimate all-caps brand token only as low-confidence review, never auto-fixed', async () => {
    prismaMock.video.findMany.mockResolvedValue([
      {
        id: 'video-5',
        slug: 'lumo-luke',
        published: true,
        title: [{ value: 'LUMO: Luke', languageId: '529' }],
        variants: []
      }
    ] as never)

    const findings = await auditSlugTitleHygiene()

    expect(findings).toHaveLength(1)
    expect(findings[0]?.needsContentReview).toBe(true)
    expect(findings[0]?.proposedValue).toBeNull()
    expect(findings[0]?.reasons).toContain('all-caps-token')
  })

  it('does not flag clean data', async () => {
    prismaMock.video.findMany.mockResolvedValue([
      {
        id: 'video-6',
        slug: 'jesus',
        published: true,
        title: [{ value: 'JESUS', languageId: '529' }],
        variants: [{ slug: 'jesus/english', languageId: '529' }]
      }
    ] as never)

    const findings = await auditSlugTitleHygiene()

    // "JESUS" still trips the low-confidence all-caps heuristic by design —
    // this repo's own catalog has legitimate all-caps titles, so that
    // heuristic can never be zero-hit. Assert it is review-only, not silent.
    expect(findings).toHaveLength(1)
    expect(findings[0]?.field).toBe('VideoTitle.value')
    expect(findings[0]?.needsContentReview).toBe(true)
  })

  it('never calls a write method on the prisma client', async () => {
    prismaMock.video.findMany.mockResolvedValue([
      {
        id: 'video-1',
        slug: 'brand-video',
        published: true,
        title: [{ value: 'Brand_Video', languageId: '529' }],
        variants: []
      }
    ] as never)

    await auditSlugTitleHygiene()

    expect(prismaMock.video.update).not.toHaveBeenCalled()
    expect(prismaMock.video.updateMany).not.toHaveBeenCalled()
    expect(prismaMock.videoTitle.update).not.toHaveBeenCalled()
    expect(prismaMock.videoVariant.update).not.toHaveBeenCalled()
  })
})
