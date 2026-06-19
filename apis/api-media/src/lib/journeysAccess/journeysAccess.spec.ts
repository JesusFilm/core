import { GraphQLError } from 'graphql'

import { journeysPrismaMock } from '../../../test/journeysPrismaMock'

import {
  assertTeamMembership,
  maybeResolveTeamId,
  resolveAuthorizedTeamId
} from './journeysAccess'

describe('journeysAccess', () => {
  describe('assertTeamMembership', () => {
    it('should resolve when the user is a member of the team', async () => {
      journeysPrismaMock.userTeam.findUnique.mockResolvedValue({
        id: 'userTeamId'
      } as never)

      await expect(
        assertTeamMembership({ teamId: 'teamId', userId: 'userId' })
      ).resolves.toBeUndefined()

      expect(journeysPrismaMock.userTeam.findUnique).toHaveBeenCalledWith({
        where: { teamId_userId: { teamId: 'teamId', userId: 'userId' } }
      })
    })

    it('should throw FORBIDDEN when the user is not a member', async () => {
      journeysPrismaMock.userTeam.findUnique.mockResolvedValue(null)

      await expect(
        assertTeamMembership({ teamId: 'teamId', userId: 'userId' })
      ).rejects.toThrow(
        new GraphQLError('Not a member of this team', {
          extensions: { code: 'FORBIDDEN' }
        })
      )
    })
  })

  describe('resolveAuthorizedTeamId', () => {
    it('should return the journey teamId when the user is a member', async () => {
      journeysPrismaMock.journey.findUnique.mockResolvedValue({
        teamId: 'teamId',
        team: { userTeams: [{ id: 'userTeamId' }] }
      } as never)

      const teamId = await resolveAuthorizedTeamId({
        journeyId: 'journeyId',
        userId: 'userId'
      })

      expect(teamId).toBe('teamId')
      expect(journeysPrismaMock.journey.findUnique).toHaveBeenCalledWith({
        where: { id: 'journeyId' },
        select: {
          teamId: true,
          team: {
            select: {
              userTeams: { where: { userId: 'userId' }, select: { id: true } }
            }
          }
        }
      })
    })

    it('should throw FORBIDDEN with a uniform shape when the journey does not exist', async () => {
      journeysPrismaMock.journey.findUnique.mockResolvedValue(null)

      await expect(
        resolveAuthorizedTeamId({ journeyId: 'journeyId', userId: 'userId' })
      ).rejects.toThrow(
        new GraphQLError('Not a member of this team', {
          extensions: { code: 'FORBIDDEN' }
        })
      )
    })

    it('should throw FORBIDDEN when the user is not a member of the journey team', async () => {
      journeysPrismaMock.journey.findUnique.mockResolvedValue({
        teamId: 'teamId',
        team: { userTeams: [] }
      } as never)

      await expect(
        resolveAuthorizedTeamId({ journeyId: 'journeyId', userId: 'userId' })
      ).rejects.toThrow(
        new GraphQLError('Not a member of this team', {
          extensions: { code: 'FORBIDDEN' }
        })
      )
    })
  })

  describe('maybeResolveTeamId', () => {
    it('should return null when no journeyId is provided', async () => {
      const teamId = await maybeResolveTeamId({ userId: 'userId' })

      expect(teamId).toBeNull()
      expect(journeysPrismaMock.journey.findUnique).not.toHaveBeenCalled()
    })

    it('should throw FORBIDDEN when journeyId is provided without a user', async () => {
      await expect(
        maybeResolveTeamId({ journeyId: 'journeyId', userId: null })
      ).rejects.toThrow(
        new GraphQLError('journeyId requires an authenticated user', {
          extensions: { code: 'FORBIDDEN' }
        })
      )
      expect(journeysPrismaMock.journey.findUnique).not.toHaveBeenCalled()
    })

    it('should resolve the authorized teamId when both journeyId and user are provided', async () => {
      journeysPrismaMock.journey.findUnique.mockResolvedValue({
        teamId: 'teamId',
        team: { userTeams: [{ id: 'userTeamId' }] }
      } as never)

      const teamId = await maybeResolveTeamId({
        journeyId: 'journeyId',
        userId: 'userId'
      })

      expect(teamId).toBe('teamId')
    })
  })
})
