import { GraphQLError } from 'graphql'

import { journeysPrismaMock } from '../../../test/journeysPrismaMock'

import { assertTeamMembership, resolveAuthorizedTeamId } from './journeysAccess'

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
        teamId: 'teamId'
      } as never)
      journeysPrismaMock.userTeam.findUnique.mockResolvedValue({
        id: 'userTeamId'
      } as never)

      const teamId = await resolveAuthorizedTeamId({
        journeyId: 'journeyId',
        userId: 'userId'
      })

      expect(teamId).toBe('teamId')
      expect(journeysPrismaMock.journey.findUnique).toHaveBeenCalledWith({
        where: { id: 'journeyId' },
        select: { teamId: true }
      })
    })

    it('should throw NOT_FOUND when the journey does not exist', async () => {
      journeysPrismaMock.journey.findUnique.mockResolvedValue(null)

      await expect(
        resolveAuthorizedTeamId({ journeyId: 'journeyId', userId: 'userId' })
      ).rejects.toThrow(
        new GraphQLError('Journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      )
    })

    it('should throw FORBIDDEN when the user is not a member of the journey team', async () => {
      journeysPrismaMock.journey.findUnique.mockResolvedValue({
        teamId: 'teamId'
      } as never)
      journeysPrismaMock.userTeam.findUnique.mockResolvedValue(null)

      await expect(
        resolveAuthorizedTeamId({ journeyId: 'journeyId', userId: 'userId' })
      ).rejects.toThrow(
        new GraphQLError('Not a member of this team', {
          extensions: { code: 'FORBIDDEN' }
        })
      )
    })
  })
})
