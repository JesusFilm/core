import { graphql } from '@core/shared/gql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

describe('team invitation queries', () => {
  const authClient = getClient({
    headers: {
      authorization: 'token'
    }
  })

  const INVITATIONS_QUERY = graphql(`
    query LuminaTeamInvitations($teamId: ID!) {
      luminaTeamInvitations(teamId: $teamId) {
        id
        teamId
        email
        role
        createdAt
        updatedAt
      }
    }
  `)

  const INVITATION_QUERY = graphql(`
    query LuminaTeamInvitation($id: ID!) {
      luminaTeamInvitation(id: $id) {
        ... on QueryLuminaTeamInvitationSuccess {
          data {
            id
            teamId
            email
            role
            createdAt
            updatedAt
          }
        }
        ... on NotFoundError {
          message
        }
      }
    }
  `)

  describe('luminaTeamInvitations', () => {
    it('should query invitations', async () => {
      prismaMock.teamInvitation.findMany.mockResolvedValue([
        {
          id: 'invitationId',
          teamId: 'teamId',
          email: 'test@example.com',
          role: 'MEMBER',
          tokenHash: 'test-hash',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ])

      const data = await authClient({
        document: INVITATIONS_QUERY,
        variables: { teamId: 'teamId' }
      })

      expect(data).toHaveProperty('data.luminaTeamInvitations', [
        {
          id: 'invitationId',
          teamId: 'teamId',
          email: 'test@example.com',
          role: 'MEMBER',
          createdAt: new Date('2024-01-01').toISOString(),
          updatedAt: new Date('2024-01-01').toISOString()
        }
      ])
    })
  })

  describe('luminaTeamInvitation', () => {
    it('should query single invitation', async () => {
      prismaMock.teamInvitation.findUnique.mockResolvedValue({
        id: 'invitationId',
        teamId: 'teamId',
        email: 'test@example.com',
        role: 'MEMBER',
        tokenHash: 'test-hash',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: INVITATION_QUERY,
        variables: { id: 'invitationId' }
      })

      expect(data).toHaveProperty('data.luminaTeamInvitation.data', {
        id: 'invitationId',
        teamId: 'teamId',
        email: 'test@example.com',
        role: 'MEMBER',
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString()
      })
    })

    it('should return NotFoundError when invitation not found', async () => {
      prismaMock.teamInvitation.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: INVITATION_QUERY,
        variables: { id: 'nonExistentId' }
      })

      expect(data).toHaveProperty(
        'data.luminaTeamInvitation.message',
        'Team invitation not found'
      )
    })
  })
})
