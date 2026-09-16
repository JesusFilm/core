import path from 'path'

import {
  type Mock,
  afterAll,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest'

import '../../test/prismaMock'

import type { ParentVariantAuditResult } from './audit-parent-variants'
import { auditParentVariants } from './audit-parent-variants'
import type { ParentLanguageRepairSummary } from './parent-language-repair'
import { applyParentLanguageRepairs } from './parent-language-repair'
// eslint-disable-next-line import/order -- must follow the mocks above
import { main, runParentLanguageAudit } from './run-parent-language-audit'

vi.mock('./audit-parent-variants', () => ({
  auditParentVariants: vi.fn()
}))
vi.mock('./parent-language-repair', () => ({
  applyParentLanguageRepairs: vi.fn()
}))

const files = new Map<string, string>()

vi.mock('fs', () => {
  const fsMock = { existsSync: vi.fn(() => true) }
  return { ...fsMock, default: fsMock }
})

vi.mock('fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn((path: string) => {
    if (!files.has(path)) {
      const error: NodeJS.ErrnoException = new Error('ENOENT')
      error.code = 'ENOENT'
      return Promise.reject(error)
    }
    return Promise.resolve(files.get(path) as string)
  }),
  writeFile: vi.fn((path: string, data: string) => {
    files.set(path, data)
    return Promise.resolve()
  })
}))

const mockedAudit = auditParentVariants as unknown as Mock
const mockedRepair = applyParentLanguageRepairs as unknown as Mock

function auditResult(
  overrides: Partial<ParentVariantAuditResult> = {}
): ParentVariantAuditResult {
  return {
    applied: false,
    deterministicGaps: [],
    ambiguous: [],
    ...overrides
  }
}

function repairSummary(
  overrides: Partial<ParentLanguageRepairSummary> = {}
): ParentLanguageRepairSummary {
  return {
    applied: false,
    repaired: [],
    indexIncomplete: [],
    failed: [],
    pendingIndexRetries: [],
    ...overrides
  }
}

const ORIGINAL_ARGV = process.argv
const RETRY_PATH = path.resolve(
  '.cache/api-media',
  'parent-language-audit-index-retry.json'
)

describe('run-parent-language-audit', () => {
  beforeEach(() => {
    files.clear()
    mockedAudit.mockReset()
    mockedRepair.mockReset()
    process.argv = ['node', 'run-parent-language-audit.ts']
  })

  afterAll(() => {
    process.argv = ORIGINAL_ARGV
  })

  it('runs dry run by default, never passing pendingIndexRetries to the repair step', async () => {
    mockedAudit.mockResolvedValue(auditResult())
    mockedRepair.mockResolvedValue(repairSummary())

    const { repair } = await runParentLanguageAudit(false)

    expect(mockedRepair).toHaveBeenCalledWith([], {
      apply: false,
      pendingIndexRetries: []
    })
    expect(repair.applied).toBe(false)
  })

  it('loads pending index retries from disk and persists the updated list after an apply run', async () => {
    const savedRetry = {
      parentVideoId: 'series-2',
      childVideoId: 'episode-2',
      languageId: '6788',
      variantId: '6788_series-2',
      action: 'createGeneratedParentVariant' as const
    }
    files.set(RETRY_PATH, JSON.stringify([savedRetry]))
    mockedAudit.mockResolvedValue(auditResult())
    mockedRepair.mockResolvedValue(
      repairSummary({ applied: true, pendingIndexRetries: [] })
    )

    await runParentLanguageAudit(true)

    expect(mockedRepair).toHaveBeenCalledWith([], {
      apply: true,
      pendingIndexRetries: [savedRetry]
    })
    expect(files.get(RETRY_PATH)).toBe('[]')
  })

  it('exits non-zero when apply mode leaves index-incomplete or failed entries', async () => {
    mockedAudit.mockResolvedValue(auditResult())
    mockedRepair.mockResolvedValue(
      repairSummary({
        applied: true,
        indexIncomplete: [
          {
            parentVideoId: 'series-1',
            childVideoId: 'episode-1',
            languageId: '20770',
            variantId: '20770_series-1',
            action: 'createGeneratedParentVariant',
            result: 'indexIncomplete',
            error: 'Algolia unavailable'
          }
        ],
        pendingIndexRetries: [
          {
            parentVideoId: 'series-1',
            childVideoId: 'episode-1',
            languageId: '20770',
            variantId: '20770_series-1',
            action: 'createGeneratedParentVariant'
          }
        ]
      })
    )
    process.argv.push('--apply')
    process.exitCode = undefined

    await main()

    expect(process.exitCode).toBe(1)
  })

  it('exits 0 in dry run even when deterministic gaps are reported', async () => {
    mockedAudit.mockResolvedValue(
      auditResult({
        deterministicGaps: [
          {
            parentVideoId: 'series-1',
            childVideoId: 'episode-1',
            languageId: '20770',
            variantId: '20770_series-1',
            action: 'createGeneratedParentVariant',
            result: 'proposed'
          }
        ]
      })
    )
    mockedRepair.mockResolvedValue(repairSummary())
    process.exitCode = undefined

    await main()

    expect(process.exitCode).toBeUndefined()
  })
})
