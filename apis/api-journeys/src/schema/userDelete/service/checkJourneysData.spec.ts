import { prismaMock } from '../../../../test/prismaMock'

import { checkJourneysData } from './checkJourneysData'

describe('checkJourneysData', () => {
  it('should return zero counts when user has no journeys or teams', async () => {
    prismaMock.userJourney.findMany.mockResolvedValueOnce([])
    prismaMock.userTeam.findMany.mockResolvedValueOnce([])
    prismaMock.userRole.count.mockResolvedValueOnce(0)
    prismaMock.journeyProfile.count.mockResolvedValueOnce(0)
    prismaMock.integration.count.mockResolvedValueOnce(0)
    prismaMock.visitor.count.mockResolvedValueOnce(0)
    prismaMock.journeyNotification.count.mockResolvedValueOnce(0)
    prismaMock.userTeamInvite.count.mockResolvedValueOnce(0)
    prismaMock.userInvite.count.mockResolvedValueOnce(0)
    prismaMock.journeyEventsExportLog.count.mockResolvedValueOnce(0)
    prismaMock.journeyTheme.count.mockResolvedValueOnce(0)

    const result = await checkJourneysData('user-1')

    expect(result.journeysToDelete).toBe(0)
    expect(result.journeysToTransfer).toBe(0)
    expect(result.journeysToRemove).toBe(0)
    expect(result.teamsToDelete).toBe(0)
    expect(result.teamsToTransfer).toBe(0)
    expect(result.teamsToRemove).toBe(0)
    expect(result.logs.length).toBeGreaterThan(0)
  })

  it('should count sole-accessor journeys as toDelete', async () => {
    prismaMock.userJourney.findMany.mockResolvedValueOnce([
      {
        id: 'uj1',
        userId: 'user-1',
        role: 'owner',
        journey: {
          id: 'j1',
          title: 'My Journey',
          userJourneys: [{ id: 'uj1', userId: 'user-1', role: 'owner' }]
        }
      }
    ] as any)
    prismaMock.userTeam.findMany.mockResolvedValueOnce([])
    prismaMock.userRole.count.mockResolvedValueOnce(0)
    prismaMock.journeyProfile.count.mockResolvedValueOnce(0)
    prismaMock.integration.count.mockResolvedValueOnce(0)
    prismaMock.visitor.count.mockResolvedValueOnce(0)
    prismaMock.journeyNotification.count.mockResolvedValueOnce(0)
    prismaMock.userTeamInvite.count.mockResolvedValueOnce(0)
    prismaMock.userInvite.count.mockResolvedValueOnce(0)
    prismaMock.journeyEventsExportLog.count.mockResolvedValueOnce(0)
    prismaMock.journeyTheme.count.mockResolvedValueOnce(0)

    const result = await checkJourneysData('user-1')

    expect(result.journeysToDelete).toBe(1)
    expect(result.journeysToTransfer).toBe(0)
    expect(result.journeysToRemove).toBe(0)
  })

  it('should count shared journeys where user is owner as toTransfer', async () => {
    prismaMock.userJourney.findMany.mockResolvedValueOnce([
      {
        id: 'uj1',
        userId: 'user-1',
        role: 'owner',
        journey: {
          id: 'j1',
          title: 'Shared Journey',
          userJourneys: [
            { id: 'uj1', userId: 'user-1', role: 'owner' },
            { id: 'uj2', userId: 'user-2', role: 'editor' }
          ]
        }
      }
    ] as any)
    prismaMock.userTeam.findMany.mockResolvedValueOnce([])
    prismaMock.userRole.count.mockResolvedValueOnce(0)
    prismaMock.journeyProfile.count.mockResolvedValueOnce(0)
    prismaMock.integration.count.mockResolvedValueOnce(0)
    prismaMock.visitor.count.mockResolvedValueOnce(0)
    prismaMock.journeyNotification.count.mockResolvedValueOnce(0)
    prismaMock.userTeamInvite.count.mockResolvedValueOnce(0)
    prismaMock.userInvite.count.mockResolvedValueOnce(0)
    prismaMock.journeyEventsExportLog.count.mockResolvedValueOnce(0)
    prismaMock.journeyTheme.count.mockResolvedValueOnce(0)

    const result = await checkJourneysData('user-1')

    expect(result.journeysToDelete).toBe(0)
    expect(result.journeysToTransfer).toBe(1)
    expect(result.journeysToRemove).toBe(0)
  })

  it('should count shared journeys where user is not owner as toRemove', async () => {
    prismaMock.userJourney.findMany.mockResolvedValueOnce([
      {
        id: 'uj1',
        userId: 'user-1',
        role: 'editor',
        journey: {
          id: 'j1',
          title: 'Other Journey',
          userJourneys: [
            { id: 'uj1', userId: 'user-1', role: 'editor' },
            { id: 'uj2', userId: 'user-2', role: 'owner' }
          ]
        }
      }
    ] as any)
    prismaMock.userTeam.findMany.mockResolvedValueOnce([])
    prismaMock.userRole.count.mockResolvedValueOnce(0)
    prismaMock.journeyProfile.count.mockResolvedValueOnce(0)
    prismaMock.integration.count.mockResolvedValueOnce(0)
    prismaMock.visitor.count.mockResolvedValueOnce(0)
    prismaMock.journeyNotification.count.mockResolvedValueOnce(0)
    prismaMock.userTeamInvite.count.mockResolvedValueOnce(0)
    prismaMock.userInvite.count.mockResolvedValueOnce(0)
    prismaMock.journeyEventsExportLog.count.mockResolvedValueOnce(0)
    prismaMock.journeyTheme.count.mockResolvedValueOnce(0)

    const result = await checkJourneysData('user-1')

    expect(result.journeysToDelete).toBe(0)
    expect(result.journeysToTransfer).toBe(0)
    expect(result.journeysToRemove).toBe(1)
  })

  it('should count sole-member teams as toDelete', async () => {
    prismaMock.userJourney.findMany.mockResolvedValueOnce([])
    prismaMock.userTeam.findMany.mockResolvedValueOnce([
      {
        id: 'ut1',
        userId: 'user-1',
        role: 'manager',
        team: {
          id: 't1',
          title: 'My Team',
          userTeams: [{ id: 'ut1', userId: 'user-1', role: 'manager' }]
        }
      }
    ] as any)
    prismaMock.userRole.count.mockResolvedValueOnce(0)
    prismaMock.journeyProfile.count.mockResolvedValueOnce(0)
    prismaMock.integration.count.mockResolvedValueOnce(0)
    prismaMock.visitor.count.mockResolvedValueOnce(0)
    prismaMock.journeyNotification.count.mockResolvedValueOnce(0)
    prismaMock.userTeamInvite.count.mockResolvedValueOnce(0)
    prismaMock.userInvite.count.mockResolvedValueOnce(0)
    prismaMock.journeyEventsExportLog.count.mockResolvedValueOnce(0)
    prismaMock.journeyTheme.count.mockResolvedValueOnce(0)

    const result = await checkJourneysData('user-1')

    expect(result.teamsToDelete).toBe(1)
  })

  it('should report related records to clean up', async () => {
    prismaMock.userJourney.findMany.mockResolvedValueOnce([])
    prismaMock.userTeam.findMany.mockResolvedValueOnce([])
    prismaMock.userRole.count.mockResolvedValueOnce(1)
    prismaMock.journeyProfile.count.mockResolvedValueOnce(1)
    prismaMock.integration.count.mockResolvedValueOnce(0)
    prismaMock.visitor.count.mockResolvedValueOnce(0)
    prismaMock.journeyNotification.count.mockResolvedValueOnce(0)
    prismaMock.userTeamInvite.count.mockResolvedValueOnce(0)
    prismaMock.userInvite.count.mockResolvedValueOnce(0)
    prismaMock.journeyEventsExportLog.count.mockResolvedValueOnce(0)
    prismaMock.journeyTheme.count.mockResolvedValueOnce(0)

    const result = await checkJourneysData('user-1')

    const cleanupLog = result.logs.find((l) =>
      l.message.includes('Related records')
    )
    expect(cleanupLog).toBeDefined()
    expect(cleanupLog?.message).toContain('UserRole(1)')
    expect(cleanupLog?.message).toContain('JourneyProfile(1)')
  })
})
