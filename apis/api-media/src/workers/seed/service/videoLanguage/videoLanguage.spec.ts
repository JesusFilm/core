import { vi } from 'vitest'

import { verifyAvailableLanguages } from '../../../../schema/video/lib/verifyAvailableLanguages'
import { logger } from '../../../lib/logger'

import { seedVideoLanguages } from './videoLanguage'

vi.mock('../../../../schema/video/lib/verifyAvailableLanguages', () => ({
  verifyAvailableLanguages: vi.fn()
}))

vi.mock('../../../lib/logger', () => ({
  logger: { error: vi.fn() }
}))

const mockedVerifyAvailableLanguages = vi.mocked(verifyAvailableLanguages)

describe('seedVideoLanguages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('delegates to the batch verifier in fix mode, so seeding uses the same dependency-ordered recompute', async () => {
    mockedVerifyAvailableLanguages.mockResolvedValueOnce({
      checked: 2,
      mismatches: [],
      fixed: [],
      cycleVideoIds: [],
      blockedAncestorVideoIds: []
    })

    await seedVideoLanguages()

    expect(mockedVerifyAvailableLanguages).toHaveBeenCalledWith({
      fix: true
    })
    expect(logger.error).not.toHaveBeenCalled()
  })

  it('logs videos left unresolved by a children/parents cycle instead of silently dropping them', async () => {
    mockedVerifyAvailableLanguages.mockResolvedValueOnce({
      checked: 1,
      mismatches: [],
      fixed: [],
      cycleVideoIds: ['cyclic-a', 'cyclic-b'],
      blockedAncestorVideoIds: []
    })

    await seedVideoLanguages()

    expect(logger.error).toHaveBeenCalledWith(
      { cycleVideoIds: ['cyclic-a', 'cyclic-b'] },
      'seedVideoLanguages: videos on a children/parents cycle were skipped'
    )
  })

  it('logs ancestors blocked by a descendant cycle separately from the cycle itself', async () => {
    mockedVerifyAvailableLanguages.mockResolvedValueOnce({
      checked: 1,
      mismatches: [],
      fixed: [],
      cycleVideoIds: ['cyclic-a', 'cyclic-b'],
      blockedAncestorVideoIds: ['parent']
    })

    await seedVideoLanguages()

    expect(logger.error).toHaveBeenCalledWith(
      { blockedAncestorVideoIds: ['parent'] },
      'seedVideoLanguages: videos blocked by a descendant cycle were skipped'
    )
  })
})
