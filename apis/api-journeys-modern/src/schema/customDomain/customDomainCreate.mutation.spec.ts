import { ExecutionResult } from 'graphql'

import {
  CustomDomain,
  Prisma,
  UserTeamRole
} from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

import {
  createVercelDomain,
  deleteVercelDomain,
  isDomainValid,
  updateTeamShortLinks
} from './service'

jest.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: jest.fn()
}))

jest.mock('./service', () => ({
  isDomainValid: jest.fn(),
  createVercelDomain: jest.fn(),
  deleteVercelDomain: jest.fn(),
  updateTeamShortLinks: jest.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as jest.MockedFunction<
  typeof getUserFromPayload
>

const mockIsDomainValid = isDomainValid as jest.MockedFunction<
  typeof isDomainValid
>
const mockCreateVercelDomain = createVercelDomain as jest.MockedFunction<
  typeof createVercelDomain
>
const mockDeleteVercelDomain = deleteVercelDomain as jest.MockedFunction<
  typeof deleteVercelDomain
>
const mockUpdateTeamShortLinks = updateTeamShortLinks as jest.MockedFunction<
  typeof updateTeamShortLinks
>

describe('customDomainCreate', () => {
  const mockUser = {
    id: 'userId',
    email: 'test@example.com',
    emailVerified: true,
    firstName: 'Test',
    lastName: 'User',
    imageUrl: null,
    roles: []
  }

  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const MUTATION = graphql(`
    mutation CustomDomainCreate($input: CustomDomainCreateInput!) {
      customDomainCreate(input: $input) {
        id
        name
        apexName
        routeAllTeamJourneys
      }
    }
  `)

  const mockCustomDomain: CustomDomain = {
    id: 'customDomainId',
    name: 'www.example.com',
    apexName: 'example.com',
    teamId: 'teamId',
    routeAllTeamJourneys: true,
    journeyCollectionId: null
  }

  const mockCustomDomainWithTeam = {
    ...mockCustomDomain,
    team: {
      id: 'teamId',
      userTeams: [{ userId: 'userId', role: UserTeamRole.manager }]
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'userRoleId',
      userId: mockUser.id,
      roles: []
    })
    prismaMock.$transaction.mockImplementation(
      async (cb: any) => await cb(prismaMock)
    )
  })

  it('should create a custom domain when authorized', async () => {
    mockIsDomainValid.mockReturnValue(true)
    mockCreateVercelDomain.mockResolvedValue({
      name: 'www.example.com',
      apexName: 'example.com'
    })
    prismaMock.customDomain.create.mockResolvedValue(
      mockCustomDomainWithTeam as any
    )
    mockUpdateTeamShortLinks.mockResolvedValue()

    const result = (await authClient({
      document: MUTATION,
      variables: {
        input: {
          name: 'www.example.com',
          teamId: 'teamId'
        }
      }
    })) as ExecutionResult<{
      customDomainCreate: typeof mockCustomDomain
    }>

    expect(result.errors).toBeUndefined()
    expect(result.data?.customDomainCreate).toMatchObject({
      id: 'customDomainId',
      name: 'www.example.com',
      apexName: 'example.com',
      routeAllTeamJourneys: true
    })
    expect(mockIsDomainValid).toHaveBeenCalledWith('www.example.com')
    expect(mockCreateVercelDomain).toHaveBeenCalledWith('www.example.com')
    expect(mockUpdateTeamShortLinks).toHaveBeenCalledWith(
      'teamId',
      'www.example.com'
    )
  })

  it('should create a custom domain with all optional fields', async () => {
    mockIsDomainValid.mockReturnValue(true)
    mockCreateVercelDomain.mockResolvedValue({
      name: 'www.example.com',
      apexName: 'example.com'
    })
    prismaMock.customDomain.create.mockResolvedValue(
      mockCustomDomainWithTeam as any
    )
    mockUpdateTeamShortLinks.mockResolvedValue()

    const result = (await authClient({
      document: MUTATION,
      variables: {
        input: {
          id: 'customId',
          name: 'www.example.com',
          teamId: 'teamId',
          journeyCollectionId: 'collectionId',
          routeAllTeamJourneys: true
        }
      }
    })) as ExecutionResult<{
      customDomainCreate: typeof mockCustomDomain
    }>

    expect(result.errors).toBeUndefined()
    expect(result.data?.customDomainCreate).toBeDefined()
    expect(prismaMock.customDomain.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: 'customId',
          name: 'www.example.com',
          apexName: 'example.com',
          team: { connect: { id: 'teamId' } },
          journeyCollection: { connect: { id: 'collectionId' } },
          routeAllTeamJourneys: true
        })
      })
    )
  })

  it('should return error for invalid domain name', async () => {
    mockIsDomainValid.mockReturnValue(false)

    const result = (await authClient({
      document: MUTATION,
      variables: {
        input: {
          name: 'invalid',
          teamId: 'teamId'
        }
      }
    })) as ExecutionResult

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0]?.message).toBe(
      'custom domain has invalid domain name'
    )
    expect(mockCreateVercelDomain).not.toHaveBeenCalled()
  })

  it('should return FORBIDDEN and delete vercel domain when user lacks team access', async () => {
    mockIsDomainValid.mockReturnValue(true)
    mockCreateVercelDomain.mockResolvedValue({
      name: 'www.example.com',
      apexName: 'example.com'
    })
    prismaMock.customDomain.create.mockResolvedValue({
      ...mockCustomDomain,
      team: {
        id: 'teamId',
        userTeams: []
      }
    } as any)
    mockDeleteVercelDomain.mockResolvedValue(true)

    const result = (await authClient({
      document: MUTATION,
      variables: {
        input: {
          name: 'www.example.com',
          teamId: 'teamId'
        }
      }
    })) as ExecutionResult

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0]?.message).toBe(
      'user is not allowed to create custom domain'
    )
    expect(mockDeleteVercelDomain).toHaveBeenCalledWith('www.example.com')
    expect(mockUpdateTeamShortLinks).not.toHaveBeenCalled()
  })

  it('should return error when custom domain already exists', async () => {
    mockIsDomainValid.mockReturnValue(true)
    mockCreateVercelDomain.mockResolvedValue({
      name: 'www.example.com',
      apexName: 'example.com'
    })
    prismaMock.customDomain.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2002',
        clientVersion: ''
      })
    )

    const result = (await authClient({
      document: MUTATION,
      variables: {
        input: {
          name: 'www.example.com',
          teamId: 'teamId'
        }
      }
    })) as ExecutionResult

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0]?.message).toBe('custom domain already exists')
  })

  it('should reject unauthenticated users', async () => {
    mockGetUserFromPayload.mockReturnValue(null)
    const unauthClient = getClient({
      headers: { authorization: 'token' },
      context: { currentUser: null }
    })

    const result = (await unauthClient({
      document: MUTATION,
      variables: {
        input: {
          name: 'www.example.com',
          teamId: 'teamId'
        }
      }
    })) as ExecutionResult

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0]?.message).toContain('Not authorized')
  })
})
