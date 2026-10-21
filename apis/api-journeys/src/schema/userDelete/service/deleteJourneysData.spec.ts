import { vi } from 'vitest'

import { prismaMock } from '../../../../test/prismaMock'
import { enqueueShortLinkDeletes } from '../../../workers/shortlinkDelete/queue'

import { deleteJourneysData } from './deleteJourneysData'

vi.mock('../../../workers/shortlinkDelete/queue', () => ({
  enqueueShortLinkDeletes: vi.fn()
}))

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
    qrCode: {
      findMany: vi.fn().mockResolvedValue([]),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 })
    },
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

  describe('QR codes', () => {
    beforeEach(() => {
      txMock.userJourney.findMany.mockResolvedValue([
        {
          id: 'uj1',
          userId: 'user-1',
          role: 'owner',
          journey: {
            id: 'j1',
            title: 'Solo',
            userJourneys: [{ id: 'uj1', userId: 'user-1', role: 'owner' }]
          }
        }
      ])
      txMock.userTeam.findMany.mockResolvedValue([
        {
          id: 'ut1',
          userId: 'user-1',
          role: 'manager',
          team: {
            id: 'teamA',
            title: 'Team A',
            userTeams: [{ id: 'ut1', userId: 'user-1', role: 'manager' }]
          }
        }
      ])
      txMock.qrCode.findMany.mockImplementation(async ({ where }: any) =>
        where.teamId != null
          ? [
              { shortLinkId: 'teamShortLink' },
              { shortLinkId: 'sharedShortLink' }
            ]
          : [
              { shortLinkId: 'journeyShortLink' },
              { shortLinkId: 'sharedShortLink' }
            ]
      )
    })

    it('reads the QR rows of and targeting the deleted journeys before deleting them', async () => {
      await deleteJourneysData('user-1')

      expect(txMock.qrCode.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ journeyId: { in: ['j1'] } }, { toJourneyId: { in: ['j1'] } }]
        },
        select: { shortLinkId: true }
      })
      expect(txMock.qrCode.findMany.mock.invocationCallOrder[0]).toBeLessThan(
        txMock.journey.deleteMany.mock.invocationCallOrder[0]
      )
    })

    it("deletes the deleted teams' QR rows before the teams", async () => {
      await deleteJourneysData('user-1')

      expect(txMock.qrCode.findMany).toHaveBeenCalledWith({
        where: { teamId: { in: ['teamA'] } },
        select: { shortLinkId: true }
      })
      expect(txMock.qrCode.deleteMany).toHaveBeenCalledWith({
        where: { teamId: { in: ['teamA'] } }
      })
      expect(txMock.qrCode.deleteMany.mock.invocationCallOrder[0]).toBeLessThan(
        txMock.team.deleteMany.mock.invocationCallOrder[0]
      )
    })

    it('enqueues both sets of short links once, after the transaction', async () => {
      let committed = false
      prismaMock.$transaction.mockImplementation(async (fn: any) => {
        const result = await fn(txMock)
        expect(enqueueShortLinkDeletes).not.toHaveBeenCalled()
        committed = true
        return result
      })

      const result = await deleteJourneysData('user-1')

      expect(result.success).toBe(true)
      expect(committed).toBe(true)
      expect(enqueueShortLinkDeletes).toHaveBeenCalledTimes(1)
      expect(enqueueShortLinkDeletes).toHaveBeenCalledWith([
        'journeyShortLink',
        'sharedShortLink',
        'teamShortLink'
      ])
    })

    it('enqueues nothing when the transaction rolls back', async () => {
      prismaMock.$transaction.mockImplementation(async (fn: any) => {
        await fn(txMock)
        throw new Error('P2003')
      })

      const result = await deleteJourneysData('user-1')

      expect(result.success).toBe(false)
      expect(enqueueShortLinkDeletes).not.toHaveBeenCalled()
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
