import { type Mock, vi } from 'vitest'

import '../../test/prismaMock'

import {
  type DownloadSizeBackfillResult,
  emptyBackfillSummary,
  runDownloadSizeBackfill
} from '../lib/downloadSizeBackfill'

// eslint-disable-next-line import/order -- must follow the mocks above
import { main } from './backfill-download-sizes'

vi.mock('../lib/downloadSizeBackfill', async () => {
  const actual = await vi.importActual<
    typeof import('../lib/downloadSizeBackfill')
  >('../lib/downloadSizeBackfill')
  return { ...actual, runDownloadSizeBackfill: vi.fn() }
})

const files = new Map<string, string>()

vi.mock('fs', () => {
  const fsMock = {
    existsSync: vi.fn(() => true),
    createWriteStream: vi.fn(() => ({
      write: vi.fn(() => true),
      end: vi.fn((cb?: (error?: Error | null) => void) => cb?.(null)),
      on: vi.fn()
    }))
  }
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

const mockedRunDownloadSizeBackfill = runDownloadSizeBackfill as unknown as Mock

const ORIGINAL_ARGV = process.argv
const ORIGINAL_ENV = { ...process.env }

function batchResult(
  overrides: Partial<DownloadSizeBackfillResult> = {}
): DownloadSizeBackfillResult {
  return {
    summary: emptyBackfillSummary(),
    records: [],
    lastProcessedId: null,
    hasMore: false,
    ...overrides
  }
}

describe('backfill-download-sizes main (resumability)', () => {
  beforeEach(() => {
    files.clear()
    mockedRunDownloadSizeBackfill.mockReset()
    process.env = { ...ORIGINAL_ENV }
    delete process.env.DOWNLOAD_SIZE_BACKFILL_RESUME
    delete process.env.DOWNLOAD_SIZE_BACKFILL_BATCH_SIZE
    delete process.env.DOWNLOAD_SIZE_BACKFILL_DOWNLOAD_ID
    delete process.env.DOWNLOAD_SIZE_BACKFILL_VARIANT_ID
    delete process.env.DOWNLOAD_SIZE_BACKFILL_PROVIDER
    process.argv = ['node', 'backfill-download-sizes.ts']
  })

  afterAll(() => {
    process.argv = ORIGINAL_ARGV
    process.env = ORIGINAL_ENV
  })

  it('resumes from the saved cursor on a later run with the same apply mode and filters', async () => {
    process.argv.push('--apply')
    process.env.DOWNLOAD_SIZE_BACKFILL_RESUME = 'true'

    mockedRunDownloadSizeBackfill.mockResolvedValueOnce(
      batchResult({ lastProcessedId: 'd5', hasMore: false })
    )
    await main()

    expect(mockedRunDownloadSizeBackfill).toHaveBeenCalledWith(
      expect.objectContaining({ startAfterId: null })
    )

    mockedRunDownloadSizeBackfill.mockResolvedValueOnce(
      batchResult({ lastProcessedId: 'd9', hasMore: false })
    )
    await main()

    expect(mockedRunDownloadSizeBackfill).toHaveBeenLastCalledWith(
      expect.objectContaining({ startAfterId: 'd5' })
    )
  })

  it('discards the saved cursor and starts over when apply mode differs from the saved run', async () => {
    process.argv.push('--apply')
    process.env.DOWNLOAD_SIZE_BACKFILL_RESUME = 'true'
    mockedRunDownloadSizeBackfill.mockResolvedValueOnce(
      batchResult({ lastProcessedId: 'd5', hasMore: false })
    )
    await main()

    process.argv = ['node', 'backfill-download-sizes.ts']
    mockedRunDownloadSizeBackfill.mockResolvedValueOnce(batchResult())
    await main()

    expect(mockedRunDownloadSizeBackfill).toHaveBeenLastCalledWith(
      expect.objectContaining({ startAfterId: null })
    )
  })

  it('discards the saved cursor and starts over when filters differ from the saved run', async () => {
    process.argv.push('--apply')
    process.env.DOWNLOAD_SIZE_BACKFILL_RESUME = 'true'
    mockedRunDownloadSizeBackfill.mockResolvedValueOnce(
      batchResult({ lastProcessedId: 'd5', hasMore: false })
    )
    await main()

    process.env.DOWNLOAD_SIZE_BACKFILL_PROVIDER = 'mux'
    mockedRunDownloadSizeBackfill.mockResolvedValueOnce(batchResult())
    await main()

    expect(mockedRunDownloadSizeBackfill).toHaveBeenLastCalledWith(
      expect.objectContaining({ startAfterId: null })
    )
  })

  it('starts from the beginning when resume is not requested, even with a saved cursor', async () => {
    process.argv.push('--apply')
    process.env.DOWNLOAD_SIZE_BACKFILL_RESUME = 'true'
    mockedRunDownloadSizeBackfill.mockResolvedValueOnce(
      batchResult({ lastProcessedId: 'd5', hasMore: false })
    )
    await main()

    process.env.DOWNLOAD_SIZE_BACKFILL_RESUME = 'false'
    mockedRunDownloadSizeBackfill.mockResolvedValueOnce(batchResult())
    await main()

    expect(mockedRunDownloadSizeBackfill).toHaveBeenLastCalledWith(
      expect.objectContaining({ startAfterId: null })
    )
  })
})
