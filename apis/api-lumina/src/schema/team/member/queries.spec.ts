import { graphql } from '@core/shared/gql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

describe('team member queries', () => {
  const authClient = getClient({
    headers: {
      authorization: 'token'
    }
  })

  const MEMBERS_QUERY = graphql(`
    query LuminaTeamMembers($teamId: ID!) {
      luminaTeamMembers(teamId: $teamId) {
        id
        teamId
        userId
        role
        createdAt
        updatedAt
      }
    }
  `)

  const MEMBER_QUERY = graphql(`
    query LuminaTeamMember($id: ID!) {
      luminaTeamMember(id: $id) {
        ... on QueryLuminaTeamMemberSuccess {
          data {
            id
            teamId
            userId
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

  it('should query team members', async () => {
    prismaMock.teamMember.findMany.mockResolvedValue([
      {
        id: 'memberId',
        teamId: 'teamId',
        userId: 'userId',
        role: 'OWNER',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ])

    const data = await authClient({
      document: MEMBERS_QUERY,
      variables: { teamId: 'teamId' }
    })

    expect(prismaMock.teamMember.findMany).toHaveBeenCalledWith({
      where: {
        team: { id: 'teamId', members: { some: { userId: 'testUserId' } } }
      }
    })
    expect(data).toHaveProperty('data.luminaTeamMembers', [
      {
        id: 'memberId',
        teamId: 'teamId',
        userId: 'userId',
        role: 'OWNER',
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString()
      }
    ])
  })

  it('should query single team member', async () => {
    prismaMock.teamMember.findUnique.mockResolvedValue({
      id: 'memberId',
      teamId: 'teamId',
      userId: 'userId',
      role: 'OWNER',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    })

    const data = await authClient({
      document: MEMBER_QUERY,
      variables: { id: 'memberId' }
    })

    expect(data).toHaveProperty('data.luminaTeamMember.data', {
      id: 'memberId',
      teamId: 'teamId',
      userId: 'userId',
      role: 'OWNER',
      createdAt: new Date('2024-01-01').toISOString(),
      updatedAt: new Date('2024-01-01').toISOString()
    })
  })

  it('should return NotFoundError when member not found', async () => {
    prismaMock.teamMember.findUnique.mockResolvedValue(null)

    const data = await authClient({
      document: MEMBER_QUERY,
      variables: { id: 'nonExistentId' }
    })

    expect(data).toHaveProperty(
      'data.luminaTeamMember.message',
      'Team member not found'
    )
  })
})
