import { UserTeamRole } from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

jest.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: jest.fn()
}))

jest.mock('./customDomain.service', () => ({
  deleteVercelDomain: jest.fn().mockResolvedValue(true),
  updateTeamShortLinks: jest.fn().mockResolvedValue(undefined)
}))

const mockGetUserFromPayload = getUserFromPayload as jest.MockedFunction<
  typeof getUserFromPayload
>

describe('customDomainDelete', () => {
  const mockUser = { id: 'userId', email: 'test@example.com' }

  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const CUSTOM_DOMAIN_DELETE_MUTATION = graphql(`
    mutation CustomDomainDelete($id: ID!) {
      customDomainDelete(id: $id) {
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

  const {
    deleteVercelDomain,
    updateTeamShortLinks
  } = require('./customDomain.service')

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser as any)
    prismaMock.userRole.findUnique.mockResolvedValue({
      userId: mockUser.id,
      roles: []
    } as any)
    prismaMock.$transaction.mockImplementation(async (fn: any) => fn(prismaMock))
  })

  it('should delete custom domain when authorized', async () => {
    prismaMock.customDomain.findUnique.mockResolvedValue(
      mockCustomDomain as any
    )
    prismaMock.customDomain.delete.mockResolvedValue(mockCustomDomain as any)

    const result = await authClient({
      document: CUSTOM_DOMAIN_DELETE_MUTATION,
      variables: { id: 'customDomainId' }
    })

    expect(result).toEqual({
      data: {
        customDomainDelete: {
          id: 'customDomainId',
          name: 'example.com',
          apexName: 'example.com',
          routeAllTeamJourneys: true
        }
      }
    })

    expect(updateTeamShortLinks).toHaveBeenCalledWith('teamId', 'example.com')
    expect(prismaMock.customDomain.delete).toHaveBeenCalledWith({
      where: { id: 'customDomainId' }
    })
    expect(deleteVercelDomain).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'customDomainId',
        name: 'example.com'
      })
    )
  })

  it('should return NOT_FOUND when custom domain does not exist', async () => {
    prismaMock.customDomain.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: CUSTOM_DOMAIN_DELETE_MUTATION,
      variables: { id: 'nonExistentId' }
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
      document: CUSTOM_DOMAIN_DELETE_MUTATION,
      variables: { id: 'customDomainId' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to delete custom domain'
        })
      ]
    })

    expect(prismaMock.customDomain.delete).not.toHaveBeenCalled()
    expect(deleteVercelDomain).not.toHaveBeenCalled()
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
      document: CUSTOM_DOMAIN_DELETE_MUTATION,
      variables: { id: 'customDomainId' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to delete custom domain'
        })
      ]
    })

    expect(prismaMock.customDomain.delete).not.toHaveBeenCalled()
    expect(deleteVercelDomain).not.toHaveBeenCalled()
  })
})
