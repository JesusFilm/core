import { Team, TeamMember } from '@core/prisma/lumina/client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

describe('team mutations', () => {
  const authClient = getClient({
    headers: {
      authorization: 'token'
    }
  })

  const CREATE_TEAM_MUTATION = graphql(`
    mutation CreateTeam($input: LuminaTeamCreateInput!) {
      luminaTeamCreate(input: $input) {
        ... on MutationLuminaTeamCreateSuccess {
          data {
            id
            name
          }
        }
        ... on ZodError {
          message
        }
      }
    }
  `)

  const UPDATE_TEAM_MUTATION = graphql(`
    mutation UpdateTeam($id: ID!, $input: LuminaTeamUpdateInput!) {
      luminaTeamUpdate(id: $id, input: $input) {
        ... on MutationLuminaTeamUpdateSuccess {
          data {
            id
            name
          }
        }
        ... on ForbiddenError {
          message
        }
        ... on NotFoundError {
          message
        }
        ... on ZodError {
          message
        }
      }
    }
  `)

  describe('luminaTeamCreate', () => {
    it('should create team with current user as owner', async () => {
      const team: Team & { members: TeamMember[] } = {
        id: 'newTeamId',
        name: 'New Team',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        members: [
          {
            id: 'memberId',
            teamId: 'newTeamId',
            userId: 'testUserId',
            role: 'OWNER',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01')
          }
        ]
      }

      prismaMock.team.create.mockResolvedValue(team)

      const data = await authClient({
        document: CREATE_TEAM_MUTATION,
        variables: {
          input: {
            name: 'New Team'
          }
        }
      })

      expect(prismaMock.team.create).toHaveBeenCalledWith({
        data: {
          name: 'New Team',
          members: { create: { userId: 'testUserId', role: 'OWNER' } }
        }
      })
      expect(data).toHaveProperty('data.luminaTeamCreate.data', {
        id: 'newTeamId',
        name: 'New Team'
      })
    })
  })

  describe('luminaTeamUpdate', () => {
    it('should update team as owner', async () => {
      prismaMock.teamMember.findUnique.mockResolvedValue({
        id: 'memberId',
        teamId: 'teamId',
        userId: 'testUserId',
        role: 'OWNER',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      prismaMock.team.update.mockResolvedValue({
        id: 'teamId',
        name: 'Updated Team',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: UPDATE_TEAM_MUTATION,
        variables: {
          id: 'teamId',
          input: {
            name: 'Updated Team'
          }
        }
      })

      expect(prismaMock.teamMember.findUnique).toHaveBeenCalledWith({
        where: { teamId_userId: { teamId: 'teamId', userId: 'testUserId' } }
      })
      expect(data).toHaveProperty('data.luminaTeamUpdate.data', {
        id: 'teamId',
        name: 'Updated Team'
      })
    })

    it('should update team as manager', async () => {
      prismaMock.teamMember.findUnique.mockResolvedValue({
        id: 'memberId',
        teamId: 'teamId',
        userId: 'testUserId',
        role: 'MANAGER',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      prismaMock.team.update.mockResolvedValue({
        id: 'teamId',
        name: 'Updated Team',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: UPDATE_TEAM_MUTATION,
        variables: {
          id: 'teamId',
          input: {
            name: 'Updated Team'
          }
        }
      })

      expect(data).toHaveProperty('data.luminaTeamUpdate.data', {
        id: 'teamId',
        name: 'Updated Team'
      })
    })

    it('should reject if team not found', async () => {
      prismaMock.teamMember.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: UPDATE_TEAM_MUTATION,
        variables: {
          id: 'nonExistentId',
          input: {
            name: 'Updated Team'
          }
        }
      })

      expect(data).toHaveProperty(
        'data.luminaTeamUpdate.message',
        'Team not found'
      )
    })

    it('should reject if user is not owner or manager', async () => {
      prismaMock.teamMember.findUnique.mockResolvedValue({
        id: 'memberId',
        teamId: 'teamId',
        userId: 'testUserId',
        role: 'MEMBER',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: UPDATE_TEAM_MUTATION,
        variables: {
          id: 'teamId',
          input: {
            name: 'Updated Team'
          }
        }
      })

      expect(data).toHaveProperty(
        'data.luminaTeamUpdate.message',
        'Only team owner or manager can update team'
      )
    })
  })
})
