import { runCatalogParentLanguageAudit } from './catalog-parent-language-audit'

function dependencies(overrides: Record<string, unknown> = {}) {
  return {
    findParentIdsBatch: vi
      .fn()
      .mockResolvedValueOnce(['parent-1'])
      .mockResolvedValueOnce([]),
    auditAndRepairParent: vi.fn().mockResolvedValue([
      {
        parentId: 'parent-1',
        childVideoId: 'child-1',
        languageId: '529',
        existingVariantId: null,
        action: 'create',
        variantId: '529_parent-1',
        result: 'proposed',
        indexResult: 'skipped'
      }
    ]),
    emit: vi.fn(),
    ...overrides
  }
}

describe('runCatalogParentLanguageAudit', () => {
  it('discovers parents in batches and reports findings without applying by default', async () => {
    const deps = dependencies()

    const summary = await runCatalogParentLanguageAudit({}, deps as never)

    expect(deps.auditAndRepairParent).toHaveBeenCalledWith('parent-1', {
      apply: false
    })
    expect(deps.emit).toHaveBeenCalledWith(
      expect.objectContaining({ parentId: 'parent-1', action: 'create' })
    )
    expect(summary).toEqual({
      parentsScanned: 1,
      totalFindings: 1,
      byAction: { create: 1 },
      byResult: { proposed: 1 },
      indexFailures: 0
    })
  })

  it('passes apply through to each parent and continues across multiple batches', async () => {
    const deps = dependencies({
      findParentIdsBatch: vi
        .fn()
        .mockResolvedValueOnce(['parent-1'])
        .mockResolvedValueOnce(['parent-2'])
        .mockResolvedValueOnce([])
    })

    await runCatalogParentLanguageAudit(
      { apply: true, batchSize: 1 },
      deps as never
    )

    expect(deps.auditAndRepairParent).toHaveBeenNthCalledWith(1, 'parent-1', {
      apply: true
    })
    expect(deps.auditAndRepairParent).toHaveBeenNthCalledWith(2, 'parent-2', {
      apply: true
    })
    expect(deps.findParentIdsBatch).toHaveBeenNthCalledWith(2, {
      afterId: 'parent-1',
      take: expect.any(Number)
    })
  })

  it('audits only the supplied parent and skips catalog pagination when parentId is given', async () => {
    const deps = dependencies()

    await runCatalogParentLanguageAudit(
      { parentId: 'single-parent' },
      deps as never
    )

    expect(deps.findParentIdsBatch).not.toHaveBeenCalled()
    expect(deps.auditAndRepairParent).toHaveBeenCalledWith('single-parent', {
      apply: false
    })
  })

  it('tallies failed and indexFailed outcomes for a non-zero exit signal', async () => {
    const deps = dependencies({
      auditAndRepairParent: vi.fn().mockResolvedValue([
        {
          parentId: 'parent-1',
          childVideoId: 'child-1',
          languageId: '529',
          existingVariantId: null,
          action: 'create',
          variantId: '529_parent-1',
          result: 'applied',
          indexResult: 'indexFailed'
        },
        {
          parentId: 'parent-1',
          childVideoId: 'child-2',
          languageId: '496',
          existingVariantId: 'existing',
          action: 'normalize',
          variantId: null,
          result: 'failed',
          indexResult: 'skipped',
          error: 'boom'
        }
      ])
    })

    const summary = await runCatalogParentLanguageAudit(
      { apply: true },
      deps as never
    )

    expect(summary.indexFailures).toBe(1)
    expect(summary.byResult.failed).toBe(1)
  })
})
