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

  it('should return error log on exception', async () => {
    mockMutate.mockRejectedValueOnce(new Error('Network error'))

    const result = await callJourneysCheck('user-123')

    expect(result.journeysToDelete).toBe(0)
    expect(result.logs[0].level).toBe('error')
    expect(result.logs[0].message).toContain('Network error')
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

  it('should return failure on exception', async () => {
    mockMutate.mockRejectedValueOnce(new Error('Timeout'))

    const result = await callJourneysConfirm('user-123')

    expect(result.success).toBe(false)
    expect(result.logs[0].message).toContain('Timeout')
  })
})
