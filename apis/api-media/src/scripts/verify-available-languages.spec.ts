import { vi } from 'vitest'

import { verifyAvailableLanguages } from '../schema/video/lib/verifyAvailableLanguages'

import { runVerifyAvailableLanguages } from './verify-available-languages'

vi.mock('../schema/video/lib/verifyAvailableLanguages', () => ({
  verifyAvailableLanguages: vi.fn()
}))

const mockedVerifyAvailableLanguages = vi.mocked(verifyAvailableLanguages)

describe('runVerifyAvailableLanguages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('makes a single call and returns completed when the walk finishes immediately', async () => {
    mockedVerifyAvailableLanguages.mockResolvedValueOnce({
      checked: 3,
      mismatches: [{ videoId: 'a', stored: [], computed: ['1'] }],
      fixed: [],
      unresolvedVideoIds: [],
      nextCursor: null
    })

    const result = await runVerifyAvailableLanguages()

    expect(mockedVerifyAvailableLanguages).toHaveBeenCalledTimes(1)
    expect(mockedVerifyAvailableLanguages).toHaveBeenCalledWith({
      fix: undefined,
      pageSize: undefined,
      cursor: null
    })
    expect(result).toEqual({
      checked: 3,
      mismatchCount: 1,
      fixedCount: 0,
      unresolvedVideoIds: [],
      completed: true
    })
  })

  it('threads the cursor through repeated calls until the walk completes', async () => {
    mockedVerifyAvailableLanguages
      .mockResolvedValueOnce({
        checked: 2,
        mismatches: [{ videoId: 'a', stored: [], computed: ['1'] }],
        fixed: ['a'],
        unresolvedVideoIds: [],
        nextCursor: { level: 0, afterId: 'b' }
      })
      .mockResolvedValueOnce({
        checked: 1,
        mismatches: [],
        fixed: [],
        unresolvedVideoIds: ['cycle-a'],
        nextCursor: null
      })

    const result = await runVerifyAvailableLanguages({ fix: true })

    expect(mockedVerifyAvailableLanguages).toHaveBeenCalledTimes(2)
    expect(mockedVerifyAvailableLanguages).toHaveBeenNthCalledWith(1, {
      fix: true,
      pageSize: undefined,
      cursor: null
    })
    expect(mockedVerifyAvailableLanguages).toHaveBeenNthCalledWith(2, {
      fix: true,
      pageSize: undefined,
      cursor: { level: 0, afterId: 'b' }
    })
    expect(result).toEqual({
      checked: 3,
      mismatchCount: 1,
      fixedCount: 1,
      unresolvedVideoIds: ['cycle-a'],
      completed: true
    })
  })

  it('stops after maxCalls and reports incomplete if the walk has not finished', async () => {
    mockedVerifyAvailableLanguages.mockResolvedValue({
      checked: 1,
      mismatches: [],
      fixed: [],
      unresolvedVideoIds: [],
      nextCursor: { level: 0, afterId: 'never-ending' }
    })

    const result = await runVerifyAvailableLanguages({ maxCalls: 3 })

    expect(mockedVerifyAvailableLanguages).toHaveBeenCalledTimes(3)
    expect(result.completed).toBe(false)
    expect(result.checked).toBe(3)
  })
})
