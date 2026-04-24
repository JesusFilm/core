import { UserTeamRole } from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

jest.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: jest.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as jest.MockedFunction<
  typeof getUserFromPayload
>

describe('customDomainUpdate', () => {
  const mockUser = { id: 'userId', email: 'test@example.com' }

  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const CUSTOM_DOMAIN_UPDATE_MUTATION = graphql(`
    mutation CustomDomainUpdate($id: ID!, $input: CustomDomainUpdateInput!) {
      customDomainUpdate(id: $id, input: $input) {
        id
        name
        apexName
        routeAllTeamJourneys
      }
    }
  `)

  const mockCustomDomain = {
    id: 'customDomainId',
    teamId: 'teamId',
    name: 'example.com',
    apexName: 'example.com',
    journeyCollectionId: null,
    routeAllTeamJourneys: true,
    team: {
      id: 'teamId',
      userTeams: [
        {
          id: 'userTeamId',
          teamId: 'teamId',
          userId: 'userId',
          role: UserTeamRole.manager,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser as any)
    prismaMock.userRole.findUnique.mockResolvedValue({
      userId: mockUser.id,
      roles: []
    } as any)
  })

  it('should update routeAllTeamJourneys', async () => {
    prismaMock.customDomain.findUnique.mockResolvedValue(
      mockCustomDomain as any
    )
    prismaMock.customDomain.update.mockResolvedValue({
      ...mockCustomDomain,
      routeAllTeamJourneys: false
    } as any)

    const result = await authClient({
      document: CUSTOM_DOMAIN_UPDATE_MUTATION,
      variables: {
        id: 'customDomainId',
        input: { routeAllTeamJourneys: false }
      }
    })

    expect(result).toEqual({
      data: {
        customDomainUpdate: {
          id: 'customDomainId',
          name: 'example.com',
          apexName: 'example.com',
          routeAllTeamJourneys: false
        }
      }
    })

    expect(prismaMock.customDomain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'customDomainId' },
        data: {
          routeAllTeamJourneys: false,
          journeyCollection: undefined
        }
      })
    )
  })

  it('should update journeyCollectionId', async () => {
    prismaMock.customDomain.findUnique.mockResolvedValue(
      mockCustomDomain as any
    )
    prismaMock.customDomain.update.mockResolvedValue({
      ...mockCustomDomain,
      journeyCollectionId: 'collectionId'
    } as any)

    const result = await authClient({
      document: CUSTOM_DOMAIN_UPDATE_MUTATION,
      variables: {
        id: 'customDomainId',
        input: { journeyCollectionId: 'collectionId' }
      }
    })

    expect(result).toEqual({
      data: {
        customDomainUpdate: {
          id: 'customDomainId',
          name: 'example.com',
          apexName: 'example.com',
          routeAllTeamJourneys: true
        }
      }
    })

    expect(prismaMock.customDomain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'customDomainId' },
        data: {
          routeAllTeamJourneys: undefined,
          journeyCollection: { connect: { id: 'collectionId' } }
        }
      })
    )
  })

  it('should return NOT_FOUND when custom domain does not exist', async () => {
    prismaMock.customDomain.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: CUSTOM_DOMAIN_UPDATE_MUTATION,
      variables: {
        id: 'nonExistentId',
        input: { routeAllTeamJourneys: false }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'custom domain not found'
        })
      ]
    })
  })

  it('should return FORBIDDEN when user is not a team manager', async () => {
    const unauthorizedCustomDomain = {
      ...mockCustomDomain,
      team: {
        id: 'teamId',
        userTeams: [
          {
            id: 'userTeamId',
            teamId: 'teamId',
            userId: 'userId',
            role: UserTeamRole.member,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      }
    }

    prismaMock.customDomain.findUnique.mockResolvedValue(
      unauthorizedCustomDomain as any
    )

    const result = await authClient({
      document: CUSTOM_DOMAIN_UPDATE_MUTATION,
      variables: {
        id: 'customDomainId',
        input: { routeAllTeamJourneys: false }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to update custom domain'
        })
      ]
    })

    expect(prismaMock.customDomain.update).not.toHaveBeenCalled()
  })

  it('should return FORBIDDEN when user is not in the team', async () => {
    const noAccessCustomDomain = {
      ...mockCustomDomain,
      team: {
        id: 'teamId',
        userTeams: []
      }
    }

    prismaMock.customDomain.findUnique.mockResolvedValue(
      noAccessCustomDomain as any
    )

    const result = await authClient({
      document: CUSTOM_DOMAIN_UPDATE_MUTATION,
      variables: {
        id: 'customDomainId',
        input: { routeAllTeamJourneys: false }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to update custom domain'
        })
      ]
    })

    expect(prismaMock.customDomain.update).not.toHaveBeenCalled()
  })
})
