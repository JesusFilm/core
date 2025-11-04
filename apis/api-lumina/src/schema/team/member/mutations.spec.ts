import { Team, TeamMember } from '@core/prisma/lumina/client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

describe('team member mutations', () => {
  const authClient = getClient({
    headers: {
      authorization: 'token'
    }
  })

  const UPDATE_MEMBER_MUTATION = graphql(`
    mutation UpdateMember($id: ID!, $input: LuminaTeamMemberUpdateInput!) {
      luminaTeamMemberUpdate(id: $id, input: $input) {
        ... on MutationLuminaTeamMemberUpdateSuccess {
          data {
            id
            role
          }
        }
        ... on ForbiddenError {
          message
        }
        ... on NotFoundError {
          message
        }
      }
    }
  `)

  const PROMOTE_OWNER_MUTATION = graphql(`
    mutation PromoteOwner($id: ID!) {
      luminaTeamMemberPromoteOwner(id: $id) {
        ... on MutationLuminaTeamMemberPromoteOwnerSuccess {
          data {
            id
            role
          }
        }
        ... on ForbiddenError {
          message
        }
        ... on NotFoundError {
          message
        }
      }
    }
  `)

  const DELETE_MEMBER_MUTATION = graphql(`
    mutation DeleteMember($id: ID!) {
      luminaTeamMemberDelete(id: $id) {
        ... on MutationLuminaTeamMemberDeleteSuccess {
          data {
            id
          }
        }
        ... on ForbiddenError {
          message
        }
        ... on NotFoundError {
          message
        }
      }
    }
  `)

  describe('luminaTeamMemberUpdate', () => {
    it('should update member role as member', async () => {
      const member: TeamMember & { team: Team & { members: TeamMember[] } } = {
        id: 'memberId',
        teamId: 'teamId',
        userId: 'otherUserId',
        role: 'MEMBER',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        team: {
          id: 'teamId',
          name: 'Test Team',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          members: [
            {
              id: 'userMemberId',
              teamId: 'teamId',
              userId: 'testUserId',
              role: 'MANAGER',
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01')
            }
          ]
        }
      }

      prismaMock.teamMember.findUnique.mockResolvedValue(member)

      prismaMock.teamMember.update.mockResolvedValue({
        id: 'memberId',
        teamId: 'teamId',
        userId: 'otherUserId',
        role: 'MANAGER',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: UPDATE_MEMBER_MUTATION,
        variables: {
          id: 'memberId',
          input: {
            role: 'MANAGER'
          }
        }
      })

      expect(data).toHaveProperty('data.luminaTeamMemberUpdate.data', {
        id: 'memberId',
        role: 'MANAGER'
      })
    })

    it('should reject if member not found', async () => {
      prismaMock.teamMember.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: UPDATE_MEMBER_MUTATION,
        variables: {
          id: 'nonExistentId',
          input: { role: 'MANAGER' }
        }
      })

      expect(data).toHaveProperty(
        'data.luminaTeamMemberUpdate.message',
        'Team member not found'
      )
    })

    it('should reject if user not owner or manager', async () => {
      const member: TeamMember & { team: Team & { members: TeamMember[] } } = {
        id: 'memberId',
        role: 'MEMBER',
        teamId: 'teamId',
        userId: 'otherUserId',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        team: {
          id: 'teamId',
          members: [
            {
              id: 'userMemberId',
              userId: 'testUserId',
              teamId: 'teamId',
              role: 'MEMBER',
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01')
            }
          ],
          name: 'Test Team',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      }

      prismaMock.teamMember.findUnique.mockResolvedValue(member)

      const data = await authClient({
        document: UPDATE_MEMBER_MUTATION,
        variables: {
          id: 'memberId',
          input: { role: 'MANAGER' }
        }
      })

      expect(data).toHaveProperty(
        'data.luminaTeamMemberUpdate.message',
        'Only team owner or manager can update member roles'
      )
    })

    it('should reject if trying to update owner role', async () => {
      const member: TeamMember & { team: Team & { members: TeamMember[] } } = {
        id: 'memberId',
        role: 'OWNER',
        teamId: 'teamId',
        userId: 'otherUserId',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        team: {
          id: 'teamId',
          members: [
            {
              id: 'userMemberId',
              userId: 'testUserId',
              teamId: 'teamId',
              role: 'MANAGER',
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01')
            }
          ],
          name: 'Test Team',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      }

      prismaMock.teamMember.findUnique.mockResolvedValue(member)

      const data = await authClient({
        document: UPDATE_MEMBER_MUTATION,
        variables: { id: 'memberId', input: { role: 'OWNER' } }
      })

      expect(data).toHaveProperty(
        'data.luminaTeamMemberUpdate.message',
        'Cannot change owner role. Use promoteOwner mutation instead.'
      )
    })
  })

  describe('luminaTeamMemberPromoteOwner', () => {
    it('should promote member to owner', async () => {
      const member: TeamMember & { team: Team & { members: TeamMember[] } } = {
        id: 'memberId',
        role: 'MANAGER',
        teamId: 'teamId',
        userId: 'otherUserId',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        team: {
          id: 'teamId',
          members: [
            {
              id: 'userMemberId',
              userId: 'testUserId',
              teamId: 'teamId',
              role: 'OWNER',
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01')
            }
          ],
          name: 'Test Team',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      }

      prismaMock.teamMember.findUnique.mockResolvedValue(member)

      prismaMock.$transaction.mockImplementation(async (callback) => {
        const tx = prismaMock
        return await callback(tx)
      })

      prismaMock.teamMember.update.mockResolvedValue({
        id: 'memberId',
        teamId: 'teamId',
        userId: 'otherUserId',
        role: 'OWNER',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: PROMOTE_OWNER_MUTATION,
        variables: { id: 'memberId' }
      })

      expect(data).toHaveProperty('data.luminaTeamMemberPromoteOwner.data', {
        id: 'memberId',
        role: 'OWNER'
      })
    })

    it('should reject if only owner can promote', async () => {
      const member: TeamMember & { team: Team & { members: TeamMember[] } } = {
        id: 'memberId',
        role: 'MANAGER',
        teamId: 'teamId',
        userId: 'otherUserId',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        team: {
          id: 'teamId',
          members: [
            {
              id: 'userMemberId',
              userId: 'testUserId',
              teamId: 'teamId',
              role: 'MANAGER',
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01')
            }
          ],
          name: 'Test Team',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      }

      prismaMock.teamMember.findUnique.mockResolvedValue(member)

      const data = await authClient({
        document: PROMOTE_OWNER_MUTATION,
        variables: { id: 'memberId' }
      })

      expect(data).toHaveProperty(
        'data.luminaTeamMemberPromoteOwner.message',
        'Only team owner can promote owner'
      )
    })

    it('should reject if member not found', async () => {
      prismaMock.teamMember.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: PROMOTE_OWNER_MUTATION,
        variables: { id: 'nonExistentId' }
      })

      expect(data).toHaveProperty(
        'data.luminaTeamMemberPromoteOwner.message',
        'Team member not found'
      )
    })
  })

  describe('luminaTeamMemberDelete', () => {
    it('should delete member', async () => {
      const member: TeamMember & { team: Team & { members: TeamMember[] } } = {
        id: 'memberId',
        teamId: 'teamId',
        userId: 'otherUserId',
        role: 'MEMBER',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        team: {
          id: 'teamId',
          name: 'Test Team',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          members: [
            {
              id: 'userMemberId',
              teamId: 'teamId',
              userId: 'testUserId',
              role: 'MANAGER',
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01')
            }
          ]
        }
      }

      prismaMock.teamMember.findUnique.mockResolvedValue(member)

      prismaMock.teamMember.delete.mockResolvedValue({
        id: 'memberId',
        teamId: 'teamId',
        userId: 'otherUserId',
        role: 'MEMBER',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: DELETE_MEMBER_MUTATION,
        variables: { id: 'memberId' }
      })

      expect(prismaMock.teamMember.delete).toHaveBeenCalledWith({
        where: { id: 'memberId' }
      })
      expect(data).toHaveProperty('data.luminaTeamMemberDelete.data', {
        id: 'memberId'
      })
    })

    it('should reject if trying to delete self', async () => {
      const member: TeamMember & { team: Team & { members: TeamMember[] } } = {
        id: 'userMemberId',
        teamId: 'teamId',
        userId: 'testUserId',
        role: 'MANAGER',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        team: {
          id: 'teamId',
          name: 'Test Team',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          members: [
            {
              id: 'userMemberId',
              teamId: 'teamId',
              userId: 'testUserId',
              role: 'MANAGER',
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01')
            }
          ]
        }
      }

      prismaMock.teamMember.findUnique.mockResolvedValue(member)

      const data = await authClient({
        document: DELETE_MEMBER_MUTATION,
        variables: { id: 'memberId' }
      })

      expect(data).toHaveProperty(
        'data.luminaTeamMemberDelete.message',
        'Cannot delete current user'
      )
    })

    it('should reject if member not found', async () => {
      prismaMock.teamMember.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: DELETE_MEMBER_MUTATION,
        variables: { id: 'nonExistentId' }
      })

      expect(data).toHaveProperty(
        'data.luminaTeamMemberDelete.message',
        'Team member not found'
      )
    })

    it('should reject if user not owner or manager', async () => {
      const member: TeamMember & { team: Team & { members: TeamMember[] } } = {
        id: 'memberId',
        role: 'MANAGER',
        teamId: 'teamId',
        userId: 'otherUserId',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        team: {
          id: 'teamId',
          name: 'Test Team',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          members: [
            {
              id: 'userMemberId',
              teamId: 'teamId',
              userId: 'testUserId',
              role: 'MEMBER',
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01')
            }
          ]
        }
      }

      prismaMock.teamMember.findUnique.mockResolvedValue(member)

      const data = await authClient({
        document: DELETE_MEMBER_MUTATION,
        variables: { id: 'memberId' }
      })

      expect(data).toHaveProperty(
        'data.luminaTeamMemberDelete.message',
        'Only team owner or manager can delete members'
      )
    })

    it('should reject if trying to delete owner', async () => {
      const member: TeamMember & { team: Team & { members: TeamMember[] } } = {
        id: 'memberId',
        role: 'OWNER',
        teamId: 'teamId',
        userId: 'otherUserId',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        team: {
          id: 'teamId',
          name: 'Test Team',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          members: [
            {
              id: 'userMemberId',
              teamId: 'teamId',
              userId: 'testUserId',
              role: 'MANAGER',
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01')
            }
          ]
        }
      }

      prismaMock.teamMember.findUnique.mockResolvedValue(member)

      const data = await authClient({
        document: DELETE_MEMBER_MUTATION,
        variables: { id: 'memberId' }
      })

      expect(data).toHaveProperty(
        'data.luminaTeamMemberDelete.message',
        'Cannot delete owner. Promote another member to owner instead then delete this member.'
      )
    })
  })
})
