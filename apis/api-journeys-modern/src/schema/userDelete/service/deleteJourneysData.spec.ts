import { vi } from 'vitest'

import { prismaMock } from '../../../../test/prismaMock'

import { deleteJourneysData } from './deleteJourneysData'

// All operations now run inside a single prisma.$transaction callback.
// The txMock must provide every Prisma method invoked across all phases.
function buildTxMock() {
  return {
    userJourney: {
      findMany: vi.fn().mockResolvedValue([]),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 })
    },
    userTeam: {
      findMany: vi.fn().mockResolvedValue([]),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 })
    },
    event: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    journeyVisitor: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    action: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    block: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    journey: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    team: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    journeyNotification: {
      deleteMany: vi.fn().mockResolvedValue({ count: 0 })
    },
    userTeamInvite: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    userInvite: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    journeyEventsExportLog: {
      deleteMany: vi.fn().mockResolvedValue({ count: 0 })
    },
    journeyTheme: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    journeyProfile: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    integration: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    userRole: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    visitor: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) }
  }
}

describe('deleteJourneysData', () => {
  let txMock: ReturnType<typeof buildTxMock>

  beforeEach(() => {
    vi.clearAllMocks()
    txMock = buildTxMock()
    prismaMock.$transaction.mockImplementation(async (fn: any, _opts?: any) =>
      fn(txMock)
    )
  })

  it('should complete all phases successfully with no data', async () => {
    const result = await deleteJourneysData('user-1')

    expect(result.success).toBe(true)
    expect(result.deletedJourneyIds).toEqual([])
    expect(result.deletedTeamIds).toEqual([])
    expect(result.deletedUserJourneyIds).toEqual([])
    expect(result.deletedUserTeamIds).toEqual([])
  })

  it('should transfer ownership and delete sole-accessor journeys', async () => {
    txMock.userJourney.findMany.mockResolvedValue([
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
    ])
    txMock.userJourney.deleteMany.mockResolvedValue({ count: 2 })
    txMock.event.deleteMany.mockResolvedValue({ count: 5 })
    txMock.journeyVisitor.deleteMany.mockResolvedValue({ count: 2 })
    txMock.action.deleteMany.mockResolvedValue({ count: 3 })
    txMock.block.deleteMany.mockResolvedValue({ count: 10 })
    txMock.journey.deleteMany.mockResolvedValue({ count: 1 })

    const result = await deleteJourneysData('user-1')

    expect(result.success).toBe(true)
    expect(result.deletedJourneyIds).toEqual(['j2'])
    expect(txMock.userJourney.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { role: 'owner' }
      })
    )
    expect(txMock.journey.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['j2'] } }
    })
  })

  it('should return success false on error', async () => {
    prismaMock.$transaction.mockRejectedValueOnce(new Error('DB crashed'))

    const result = await deleteJourneysData('user-1')

    expect(result.success).toBe(false)
    expect(result.logs.some((l) => l.level === 'error')).toBe(true)
    // Error message must not leak raw DB details to the client
    expect(result.logs.find((l) => l.level === 'error')?.message).not.toContain(
      'DB crashed'
    )
  })
})
