import { Logger } from 'pino'
import { beforeEach, vi } from 'vitest'

import { prismaMock } from '../../../test/prismaMock'
import {
  getMediaDataLangSlackConfig,
  slackChatPostMessage
} from '../../lib/slack'
import { reconcileVideoVariantReconciliation } from '../../schema/videoVariantReconciliation/reconcileVideoVariantReconciliation'

import { service, shouldAlertOnBlockedStages } from './service'

vi.mock('../../lib/slack', () => ({
  getMediaDataLangSlackConfig: vi.fn(),
  slackChatPostMessage: vi.fn()
}))
vi.mock(
  '../../schema/videoVariantReconciliation/reconcileVideoVariantReconciliation',
  () => ({ reconcileVideoVariantReconciliation: vi.fn() })
)

const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
} as unknown as Logger

function blockedRecord(processingStages: Record<string, unknown>) {
  return {
    id: 'status-1',
    videoVariantId: '2_20899-0-La-Liberte',
    status: 'degraded',
    retryAt: null,
    errorMessage: 'Record at the position 0 objectID=2_0-La-Liberte is too big',
    processingStages
  }
}

describe('videoVariantReconciliation worker service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.videoVariantReconciliation.findMany.mockResolvedValue([
      { id: 'status-1' }
    ] as never)
    prismaMock.videoVariantReconciliation.updateMany.mockResolvedValue({
      count: 1
    })
    vi.mocked(reconcileVideoVariantReconciliation).mockResolvedValue({
      publicationReady: false,
      status: 'degraded'
    })
    vi.mocked(getMediaDataLangSlackConfig).mockReturnValue({
      token: 'token',
      channelId: 'channel'
    })
  })

  it('does not page Slack when a Variant is blocked only on Algolia', async () => {
    prismaMock.videoVariantReconciliation.findUniqueOrThrow.mockResolvedValue(
      blockedRecord({
        mux: { state: 'complete', attempts: 1 },
        parentSync: { state: 'complete', attempts: 1 },
        downloads: { state: 'notApplicable', attempts: 0 },
        algoliaVideo: { state: 'failed', attempts: 1, retryable: false },
        algoliaVariant: { state: 'complete', attempts: 1 }
      }) as never
    )

    await service(mockLogger)

    expect(slackChatPostMessage).not.toHaveBeenCalled()
    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        videoVariantId: '2_20899-0-La-Liberte',
        failedStages: ['algoliaVideo']
      }),
      expect.stringContaining('Algolia indexing only')
    )
  })

  it('still pages Slack when Mux never produced a usable Variant', async () => {
    prismaMock.videoVariantReconciliation.findUniqueOrThrow.mockResolvedValue({
      ...blockedRecord({
        mux: { state: 'failed', attempts: 8 },
        parentSync: { state: 'pending', attempts: 0 },
        downloads: { state: 'pending', attempts: 0 },
        algoliaVideo: { state: 'pending', attempts: 0 },
        algoliaVariant: { state: 'pending', attempts: 0 }
      }),
      status: 'failed',
      errorMessage: 'Mux did not produce a usable Variant within two hours'
    } as never)

    await service(mockLogger)

    expect(slackChatPostMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        body: {
          text: expect.stringContaining(
            'Mux did not produce a usable Variant within two hours'
          )
        }
      })
    )
  })

  it('does not alert while a retry is still scheduled', async () => {
    prismaMock.videoVariantReconciliation.findUniqueOrThrow.mockResolvedValue({
      ...blockedRecord({ algoliaVideo: { state: 'failed', attempts: 1 } }),
      retryAt: new Date(Date.now() + 60_000)
    } as never)

    await service(mockLogger)

    expect(slackChatPostMessage).not.toHaveBeenCalled()
    expect(mockLogger.warn).not.toHaveBeenCalled()
  })
})

describe('shouldAlertOnBlockedStages', () => {
  it('alerts when any non-Algolia stage failed', () => {
    expect(shouldAlertOnBlockedStages(['algoliaVideo', 'parentSync'])).toBe(
      true
    )
    expect(shouldAlertOnBlockedStages(['downloads'])).toBe(true)
  })

  it('stays quiet when only Algolia stages failed', () => {
    expect(shouldAlertOnBlockedStages(['algoliaVideo'])).toBe(false)
    expect(shouldAlertOnBlockedStages(['algoliaVideo', 'algoliaVariant'])).toBe(
      false
    )
  })

  it('alerts when the blocked record names no failed stage', () => {
    expect(shouldAlertOnBlockedStages([])).toBe(true)
  })
})
