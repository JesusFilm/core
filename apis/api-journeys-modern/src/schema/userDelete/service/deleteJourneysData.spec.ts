import { prismaMock } from '../../../../test/prismaMock'

import { deleteJourneysData } from './deleteJourneysData'

describe('deleteJourneysData', () => {
  // Nitpick: added beforeEach to prevent cross-test mock contamination
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should complete all phases successfully with no data', async () => {
    const txMock = {
      userJourney: { findMany: jest.fn().mockResolvedValue([]) },
      userTeam: { findMany: jest.fn().mockResolvedValue([]) }
    }
    prismaMock.$transaction.mockImplementation(async (fn: any) => fn(txMock))
    prismaMock.userJourney.findMany.mockResolvedValueOnce([])
    prismaMock.userJourney.deleteMany.mockResolvedValueOnce({ count: 0 })
    prismaMock.userTeam.findMany.mockResolvedValueOnce([])
    prismaMock.userTeam.deleteMany.mockResolvedValueOnce({ count: 0 })
    prismaMock.journeyNotification.deleteMany.mockResolvedValueOnce({
      count: 0
    })
    prismaMock.userTeamInvite.deleteMany.mockResolvedValueOnce({ count: 0 })
    prismaMock.userInvite.deleteMany.mockResolvedValueOnce({ count: 0 })
    prismaMock.journeyEventsExportLog.deleteMany.mockResolvedValueOnce({
      count: 0
    })
    prismaMock.journeyTheme.deleteMany.mockResolvedValueOnce({ count: 0 })
    prismaMock.journeyProfile.deleteMany.mockResolvedValueOnce({ count: 0 })
    prismaMock.integration.deleteMany.mockResolvedValueOnce({ count: 0 })
    prismaMock.userRole.deleteMany.mockResolvedValueOnce({ count: 0 })
    prismaMock.visitor.deleteMany.mockResolvedValueOnce({ count: 0 })

    const result = await deleteJourneysData('user-1')

    expect(result.success).toBe(true)
    expect(result.deletedJourneyIds).toEqual([])
    expect(result.deletedTeamIds).toEqual([])
  })

  it('should transfer ownership and delete sole-accessor journeys', async () => {
    const txMock = {
      userJourney: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'uj1',
            userId: 'user-1',
            role: 'owner',
            journey: {
              id: 'j1',
              title: 'Shared',
              userJourneys: [
                { id: 'uj1', userId: 'user-1', role: 'owner' },
                { id: 'uj2', userId: 'user-2', role: 'editor' }
              ]
            }
          },
          {
            id: 'uj3',
            userId: 'user-1',
            role: 'owner',
            journey: {
              id: 'j2',
              title: 'Solo',
              userJourneys: [{ id: 'uj3', userId: 'user-1', role: 'owner' }]
            }
          }
        ]),
        updateMany: jest.fn().mockResolvedValue({ count: 1 })
      },
      userTeam: { findMany: jest.fn().mockResolvedValue([]) }
    }
    prismaMock.$transaction.mockImplementation(async (fn: any) => fn(txMock))
    prismaMock.userJourney.findMany.mockResolvedValueOnce([
      { id: 'uj1' },
      { id: 'uj3' }
    ] as any)
    prismaMock.userJourney.deleteMany.mockResolvedValueOnce({ count: 2 })
    prismaMock.userTeam.findMany.mockResolvedValueOnce([])
    prismaMock.userTeam.deleteMany.mockResolvedValueOnce({ count: 0 })
    prismaMock.event.deleteMany.mockResolvedValueOnce({ count: 5 })
    prismaMock.journeyVisitor.deleteMany.mockResolvedValueOnce({ count: 2 })
    prismaMock.action.deleteMany.mockResolvedValueOnce({ count: 3 })
    prismaMock.block.deleteMany.mockResolvedValueOnce({ count: 10 })
    prismaMock.journey.delete.mockResolvedValueOnce({} as any)
    prismaMock.journeyNotification.deleteMany.mockResolvedValueOnce({
      count: 0
    })
    prismaMock.userTeamInvite.deleteMany.mockResolvedValueOnce({ count: 0 })
    prismaMock.userInvite.deleteMany.mockResolvedValueOnce({ count: 0 })
    prismaMock.journeyEventsExportLog.deleteMany.mockResolvedValueOnce({
      count: 0
    })
    prismaMock.journeyTheme.deleteMany.mockResolvedValueOnce({ count: 0 })
    prismaMock.journeyProfile.deleteMany.mockResolvedValueOnce({ count: 0 })
    prismaMock.integration.deleteMany.mockResolvedValueOnce({ count: 0 })
    prismaMock.userRole.deleteMany.mockResolvedValueOnce({ count: 0 })
    prismaMock.visitor.deleteMany.mockResolvedValueOnce({ count: 0 })

    const result = await deleteJourneysData('user-1')

    expect(result.success).toBe(true)
    expect(result.deletedJourneyIds).toEqual(['j2'])
    expect(txMock.userJourney.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { role: 'owner' }
      })
    )
  })

  it('should return success false on error', async () => {
    prismaMock.$transaction.mockRejectedValueOnce(new Error('DB crashed'))

    const result = await deleteJourneysData('user-1')

    expect(result.success).toBe(false)
    expect(result.logs.some((l) => l.level === 'error')).toBe(true)
  })
})
