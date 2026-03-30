import { callJourneysCheck, callJourneysConfirm } from './journeysInterop'

const mockMutate = jest.fn()

jest.mock('@core/yoga/apolloClient', () => ({
  createApolloClient: () => ({
    mutate: (...args: unknown[]) => mockMutate(...args)
  })
}))

describe('callJourneysCheck', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return check result on success', async () => {
    const expected = {
      journeysToDelete: 2,
      journeysToTransfer: 1,
      journeysToRemove: 3,
      teamsToDelete: 0,
      teamsToTransfer: 1,
      teamsToRemove: 0,
      logs: [{ message: 'test', level: 'info', timestamp: '2026-01-01' }]
    }
    mockMutate.mockResolvedValueOnce({
      data: { userDeleteJourneysCheck: expected }
    })

    const result = await callJourneysCheck('user-123')

    expect(result).toEqual(expected)
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { userId: 'user-123' },
        fetchPolicy: 'no-cache'
      })
    )
  })

  it('should return fallback on null data', async () => {
    mockMutate.mockResolvedValueOnce({ data: null })

    const result = await callJourneysCheck('user-123')

    expect(result.journeysToDelete).toBe(0)
    expect(result.logs[0].level).toBe('error')
  })

  it('should throw on exception so callers can distinguish failure from empty', async () => {
    // Comment 5: function now rethrows instead of returning all-zero counts,
    // so callers can tell a network failure apart from "nothing to clean up".
    mockMutate.mockRejectedValueOnce(new Error('Network error'))

    await expect(callJourneysCheck('user-123')).rejects.toThrow('Network error')
  })
})

describe('callJourneysConfirm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return confirm result on success', async () => {
    const expected = {
      success: true,
      deletedJourneyIds: ['j1'],
      deletedTeamIds: ['t1'],
      deletedUserJourneyIds: ['uj1'],
      deletedUserTeamIds: ['ut1'],
      logs: [{ message: 'done', level: 'info', timestamp: '2026-01-01' }]
    }
    mockMutate.mockResolvedValueOnce({
      data: { userDeleteJourneysConfirm: expected }
    })

    const result = await callJourneysConfirm('user-123')

    expect(result).toEqual(expected)
  })

  it('should return failure on null data', async () => {
    mockMutate.mockResolvedValueOnce({ data: null })

    const result = await callJourneysConfirm('user-123')

    expect(result.success).toBe(false)
    expect(result.logs[0].level).toBe('error')
  })

  it('should throw on exception so callers can distinguish failure from empty', async () => {
    // Comment 5: function now rethrows instead of returning success:false with
    // all-zero counts, consistent with callJourneysCheck behaviour.
    mockMutate.mockRejectedValueOnce(new Error('Timeout'))

    await expect(callJourneysConfirm('user-123')).rejects.toThrow('Timeout')
  })
})
