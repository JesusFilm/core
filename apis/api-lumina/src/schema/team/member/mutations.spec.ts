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
      prismaMock.teamMember.findUnique.mockResolvedValue({
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
              role: 'MEMBER',
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01')
            }
          ]
        }
      })

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

    it('should reject if user is owner or manager', async () => {
      prismaMock.teamMember.findUnique.mockResolvedValue({
        id: 'memberId',
        role: 'MEMBER',
        team: {
          id: 'teamId',
          members: [
            {
              id: 'userMemberId',
              userId: 'testUserId',
              role: 'OWNER'
            }
          ]
        }
      })

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
  })

  describe('luminaTeamMemberPromoteOwner', () => {
    it('should promote member to owner', async () => {
      prismaMock.teamMember.findUnique.mockResolvedValue({
        id: 'memberId',
        role: 'MANAGER',
        team: {
          id: 'teamId',
          members: [
            {
              id: 'userMemberId',
              userId: 'testUserId',
              role: 'OWNER'
            }
          ]
        }
      })

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
      prismaMock.teamMember.findUnique.mockResolvedValue({
        id: 'memberId',
        teamId: 'teamId',
        userId: 'otherUserId',
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
      })

      const data = await authClient({
        document: PROMOTE_OWNER_MUTATION,
        variables: { id: 'memberId' }
      })

      expect(data).toHaveProperty(
        'data.luminaTeamMemberPromoteOwner.message',
        'Only team owner can promote owner'
      )
    })
  })

  describe('luminaTeamMemberDelete', () => {
    it('should delete member', async () => {
      prismaMock.teamMember.findUnique.mockResolvedValue({
        id: 'memberId',
        userId: 'otherUserId',
        team: {
          id: 'teamId',
          members: []
        }
      })

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
      prismaMock.teamMember.findUnique.mockResolvedValue({
        id: 'memberId',
        userId: 'testUserId',
        team: {
          id: 'teamId',
          members: []
        }
      })

      const data = await authClient({
        document: DELETE_MEMBER_MUTATION,
        variables: { id: 'memberId' }
      })

      expect(data).toHaveProperty(
        'data.luminaTeamMemberDelete.message',
        'Cannot delete current user'
      )
    })
  })
})
