import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

describe('team queries', () => {
  const authClient = getClient({
    headers: {
      authorization: 'token'
    }
  })

  const TEAMS_QUERY = graphql(`
    query LuminaTeams {
      luminaTeams {
        id
        name
        createdAt
        updatedAt
      }
    }
  `)

  const TEAM_QUERY = graphql(`
    query LuminaTeam($id: ID!) {
      luminaTeam(id: $id) {
        ... on QueryLuminaTeamSuccess {
          data {
            id
            name
          }
        }
        ... on NotFoundError {
          message
          location {
            path
            value
          }
        }
      }
    }
  `)

  it('should query teams', async () => {
    prismaMock.team.findMany.mockResolvedValue([
      {
        id: 'teamId',
        name: 'Test Team',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ])

    const data = await authClient({
      document: TEAMS_QUERY
    })

    expect(prismaMock.team.findMany).toHaveBeenCalledWith({
      where: { members: { some: { userId: 'testUserId' } } }
    })
    expect(data).toHaveProperty('data.luminaTeams', [
      {
        id: 'teamId',
        name: 'Test Team',
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString()
      }
    ])
  })

  it('should query single team', async () => {
    prismaMock.team.findUnique.mockResolvedValue({
      id: 'teamId',
      name: 'Test Team',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    })

    const data = await authClient({
      document: TEAM_QUERY,
      variables: { id: 'teamId' }
    })

    expect(prismaMock.team.findUnique).toHaveBeenCalledWith({
      where: {
        id: 'teamId',
        members: { some: { userId: 'testUserId' } }
      }
    })
    expect(data).toHaveProperty('data.luminaTeam.data', {
      id: 'teamId',
      name: 'Test Team'
    })
  })

  it('should return NotFoundError when team not found', async () => {
    prismaMock.team.findUnique.mockResolvedValue(null)

    const data = await authClient({
      document: TEAM_QUERY,
      variables: { id: 'nonExistentId' }
    })

    expect(data).toHaveProperty('data.luminaTeam.message', 'Team not found')
    expect(data).toHaveProperty('data.luminaTeam.location', [
      { path: ['luminaTeam', 'id'], value: 'nonExistentId' }
    ])
  })
})
